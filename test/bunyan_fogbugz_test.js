var BunyanFogbugz = require('../lib/bunyan_fogbugz'),
sinon             = require('sinon'),
expect            = require('chai').expect;

describe("bunyan-fogbugz", function() {

	describe("constructor", function() {

		it("should fail without a domain", function() {
			expect(function() {
				new BunyanFogbugz({
					user: "my user",
					project: "my project",
					area: "my area",
				});
			}).to.throw(/You have to provide a domain/);

		});

		it("should fail without a user", function() {
			expect(function() {
				new BunyanFogbugz({
					domain: "http://your.fogbugz.url",
					project: "my project",
					area: "my area",
				});
			}).to.throw(/You have to provide a user name/);

		});

		it("should fail without a project", function() {
			expect(function() {
				new BunyanFogbugz({
					domain: "http://your.fogbugz.url",
					user: "my user",
					area: "my area",
				});
			}).to.throw(/You must provide a FogBugz project/);
		});

		it("should fail without a area", function() {
			expect(function() {
				new BunyanFogbugz({
					domain: "http://your.fogbugz.url",
					project: "my project",
					user: "my user",
				});
			}).to.throw(/You have to provide an area/);
		});

	});

	describe("custom formatter", function() {

		it("should use the default formatter", function() {

		});

		it("should use the custom formatter", function() {

		});

	});

	describe("loggger arguments", function() {

		it("should accept a single string argument", function() {
		});

		it("should accept a single object argument", function() {
		});

		it("should accept an object and string as arguments", function() {
		});

	});

});