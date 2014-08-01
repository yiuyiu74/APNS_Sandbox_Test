var loadModule = "src/app/main.js";
globalVars = {};

dojoConfig = {
	baseUrl: __dirname, // Where we will put our packages
	async: 1, // We want to make sure we are using the "modern" loader
	hasCache: {
		"host-node": 1,
		"dom": 0
	},
	packages: [
		{name: "dojo",location: "bower_components/dojo"},
		{name: "dojox",location: "bower_components/dojox"},
		{name: "app",location: "src/app"}
	],
	deps: [ loadModule ]
};

globalVars.dirname = __dirname;

// Now load the Dojo loader
require("./bower_components/dojo/dojo.js");
