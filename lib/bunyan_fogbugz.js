var util  = require('util'),
BugzScout = require('bugzscout');

function BunyanFogbugz(options) {
	
	options = options || {};

	if (!options.domain) {throw new Error("You have to provide a domain");}
	if (!options.user) {throw new Error("You have to provide a user name");}
	if (!options.project) {throw new Error("You must provide a FogBugz project");}
	if (!options.area) {throw new Error("You have to provide an area");}

	this.customFormatter = options.customFormatter;

	var body = {
		domain: options.domain,
		user: options.user,
		project: options.project,
		area: options.area,
		email: options.email,
		forceNewBug: options.forceNewBug
	};

	this.bugzscout = new BugzScout(body);
}

BunyanFogbugz.prototype.write = function write(record){
	
	var levelName = nameFromLevel[record.level];

	var formatter = this.customFormatter ? this.customFormatter(record, levelName) : {
		description: util.format("%s %s", record.msg, record.err ? record.err : ""),
		extra: JSON.stringify(record, null, 2)
	};

	if (!formatter.description) {throw new Error("You must provide a description");}

	this.bugzscout.submit(formatter);

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