var util  = require('util'),
BugzScout = require('bugzscout');

function BunyanFogbugz(options) {
	
	options = options || {};

	if (!options.domain) {throw new Error("You have to provide a domain");}
	if (!options.user) {throw new Error("You have to provide a user name");}
	if (!options.project) {throw new Error("You must provide a FogBugz project");}
	if (!options.area) {throw new Error("You have to provide an area");}

	this.domain         = options.domain;
	this.user           = options.user;
	this.project        = options.project;
	this.area           = options.area;
	this.email          = options.email;
	this.forceNewBug    = options.forceNewBug;
	this.customFormatter = options.customFormatter;

}

BunyanFogbugz.prototype.write = function write(record, cb){
	
	if (typeof record === "string"){
		record = JSON.parse(record);
	}

	var levelName = nameFromLevel[record.level];

	var formatter = this.customFormatter ? this.customFormatter(record, levelName) : {
		description: util.format("[%s] %s", levelName.toUpperCase(), record.msg)
	};

	if (cb && !formatter.description) {return cb(Error("You must provide a description"));}

	var body = {
		domain: this.domain,
		user: this.user,
		project: this.project,
		area: this.area,
		email: this.email,
		forceNewBug: this.forceNewBug
	};

	var bugzscout = new BugzScout(body);
	bugzscout.submit(formatter, function(err, res){
		if(cb){
			cb(err, res);
		}
	});

};

var nameFromLevel = {
	10 : 'trace',
	20 : 'debug',
	30 : 'info',
	40 : 'warn',
	50 : 'error',
	60 : 'fatal'
};


module.exports = BunyanFogbugz;