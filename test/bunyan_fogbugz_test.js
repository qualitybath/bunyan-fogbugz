var BunyanFogbugz = require('../lib/bunyan_fogbugz'),
bunyan            = require('bunyan'),
sinon             = require('sinon'),
expect            = require('chai').expect;

describe("bunyan-fogbugz", function() {

	var user    = "user-name",
	project     = "project-name",
	area        = "area-name",
	domain      = "your-fogbugz-domain-name",
	email       = "email",
	forceNewBug = false,
	app         = "appName",
	level       = "error";

	describe("constructor", function() {

		it("should fail without a domain", function() {
			expect(function() {
				new BunyanFogbugz({
					user: user,
					project: project,
					area: area,
				});
			}).to.throw(/You have to provide a domain/);

		});

		it("should fail without a user", function() {
			expect(function() {
				new BunyanFogbugz({
					domain: domain,
					project: project,
					area: area,
				});
			}).to.throw(/You have to provide a user name/);

		});

		it("should fail without a project", function() {
			expect(function() {
				new BunyanFogbugz({
					domain: domain,
					user: user,
					area: area,
				});
			}).to.throw(/You must provide a FogBugz project/);
		});

		it("should fail without a area", function() {
			expect(function() {
				new BunyanFogbugz({
					domain: domain,
					project: project,
					user: user,
				});
			}).to.throw(/You have to provide an area/);
		});

	});

	describe("formatter", function() {

		it("should use the default formatter", function() {
			var bunyanFogbugz = new BunyanFogbugz({
				user: user,
				project: project,
				area: area,
				domain: domain,
				email: email,
				forceNewBug: forceNewBug
			});

			var sandbox = sinon.sandbox.create();
			var stub = sandbox.stub(bunyanFogbugz.bugzscout, "submit");

			var log = bunyan.createLogger({
				name: app,
				streams: [{
					stream: bunyanFogbugz,
					type: "raw",
					level: level
				}]
			});

			log.error("hello bunyan fogbugz");

			expect(stub.args[0][0].description).to.contain("hello bunyan fogbugz");
			expect(stub.args[0][0].extra).to.contain("name", "hostname", "pid", "level", "msg", "time", "v");
			sandbox.restore();
		});

		it("should use the custom formatter", function() {
			var bunyanFogbugz = new BunyanFogbugz({
				user: user,
				project: project,
				area: area,
				domain: domain,
				email: email,
				forceNewBug: forceNewBug,
				customFormatter: function(record, levelName) {
					return {
						description: "custom " + record.msg
					};
				}
			});

			var sandbox = sinon.sandbox.create();
			sandbox.stub(bunyanFogbugz.bugzscout, "submit");

			var log = bunyan.createLogger({
				name: app,
				streams: [{
					stream: bunyanFogbugz,
					type: "raw",
					level: level
				}]
			});

			var expectedResponse = {
				description: "custom hello bunyan fogbugz"
			};

			log.error("hello bunyan fogbugz");

			sinon.assert.calledWith(bunyanFogbugz.bugzscout.submit, expectedResponse);
			sandbox.restore();
		});

		it("should fail without a description", function() {
			expect(function() {
			var bunyanFogbugz = new BunyanFogbugz({
				user: user,
				project: project,
				area: area,
				domain: domain,
				email: email,
				forceNewBug: forceNewBug,
				customFormatter: function(record, levelName) {
					return {};
				}
			});

			var log = bunyan.createLogger({
				name: app,
				streams: [{
					stream: bunyanFogbugz,
					type: "raw",
					level: level
				}]
			});

			log.error("hello bunyan fogbugz");

			}).to.throw(/You must provide a description/);
		});

	});

	describe("loggger arguments", function() {

		it("should accept a single string argument", function() {

			var bunyanFogbugz = new BunyanFogbugz({
				user: user,
				project: project,
				area: area,
				domain: domain,
				email: email,
				forceNewBug: forceNewBug
			});
			var sandbox = sinon.sandbox.create();
			var stub = sandbox.stub(bunyanFogbugz.bugzscout, "submit");


			var log = bunyan.createLogger({
				name: app,
				streams: [{
					stream: bunyanFogbugz,
					type: "raw",
					level: level
				}]
			});

			log.error("hello bunyan fogbugz");

			expect(stub.args[0][0].description).to.contain("hello bunyan fogbugz");
			expect(stub.args[0][0].extra).to.contain("name", "hostname", "pid", "level", "msg", "time", "v");
			sandbox.restore();

		});

		it("should accept a single object argument", function() {

			var bunyanFogbugz = new BunyanFogbugz({
				user: user,
				project: project,
				area: area,
				domain: domain,
				email: email,
				forceNewBug: forceNewBug,
				customFormatter: function(record, levelName) {
					return {
						description: record.err
					};
				}
			});

			var sandbox = sinon.sandbox.create();
			var stub = sandbox.stub(bunyanFogbugz.bugzscout, "submit");

			var log = bunyan.createLogger({
				name: app,
				streams: [{
					stream: bunyanFogbugz,
					type: "raw",
					level: level
				}]
			});

			log.error({
				err: "hello bunyan fogbugz"
			});
			expect(stub.args[0][0].description).to.contain("hello bunyan fogbugz");
			sandbox.restore();
		});

		it("should accept an object and string as arguments", function() {
			var bunyanFogbugz = new BunyanFogbugz({
				user: user,
				project: project,
				area: area,
				domain: domain,
				email: email,
				forceNewBug: forceNewBug,
				customFormatter: function(record, levelName) {
					return {
						description: record.err,
						extra: record.msg
					};
				}
			});

			var sandbox = sinon.sandbox.create();
			var stub = sandbox.stub(bunyanFogbugz.bugzscout, "submit");

			var log = bunyan.createLogger({
				name: app,
				streams: [{
					stream: bunyanFogbugz,
					type: "raw",
					level: level
				}]
			});

			log.error({
				err: "hello bunyan fogbugz"
			}, "500 error");

			expect(stub.args[0][0].description).to.contain("hello bunyan fogbugz");
			expect(stub.args[0][0].extra).to.contain("500 error");
			sandbox.restore();
		});

	});

});