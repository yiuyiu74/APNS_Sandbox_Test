define([
	  "dojo/json" 
	, "dojo/node!apnagent"
	, "dojo/node!http"
	, "dojo/node!path"	
	, "dojo/node!express"
	, "dojo/node!winston"
	, "dojo/node!body-parser"
	, "dojo/node!method-override"
	, "dojo/node!errorhandler"
	, "dojo/node!tempusjs"
], function(JSON, apnagent, http, path, express, winston, body_parser, method_override, errorHandler, tempus){
	var app = express();
	var server = http.createServer(app)
	globalVars.app = app ;
	globalVars.logger = new (winston.Logger)({
		transports: [
			new (winston.transports.Console)({timestamp: function(){
				var dateobj = tempus();
				return dateobj.format("%Y-%m-%d %H:%M:%S");
			}})
		]
	});

	globalVars.app.use(errorHandler({server: server}));
	globalVars.app.use(body_parser.urlencoded({extended: true}));
	globalVars.app.use(body_parser.json());
	globalVars.app.use(method_override('X-HTTP-Method-Override'));
	globalVars.app.set('port',8000);

	globalVars.app.use(express.static(globalVars.dirname + '/public'));	

	
	var agent = new apnagent.Agent();
	// configure agent
	agent.set('cert file', path.join(globalVars.dirname, 'src/certs/apns-dev-cert.pem')).set('key file',  path.join(globalVars.dirname, 'src/certs/apns-dev-key-noenc.pem')).enable('sandbox');
	agent.set('expires', '1d');
	agent.connect(function (err) {
		if (err) throw err;
		console.log('apn agent running');
	});	
	
	// mount to app
	globalVars.app.set('apn', agent).set('apn-env', 'live-sandbox');
	
	globalVars.app.get('/apn', function (req, res) {
		globalVars.logger.info("Send message"); 
		
		var agent = globalVars.app.get('apn')
		, alert = "Test"
		, token = "";
		
		agent.createMessage()
			.device(token)
			.alert(alert)
			.send(function (err) {
				// handle apnagent custom errors
				if (err && err.toJSON) {
					res.json(400, { error: err.toJSON(false) });
				} 

				// handle anything else (not likely)
				else if (err) {
					res.json(400, { error: err.message });
				}

				// it was a success
				else {
					res.json({ success: true });
				}
			});
	});

	
	
	server.listen(globalVars.app.get('port'), function(){ 
		globalVars.logger.info("Express server listening at port " + app.get('port')); 
	});
});

