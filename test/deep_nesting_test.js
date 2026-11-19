var childProcess = require('child_process'),
	path          = require('path'),
	bunyan        = require('bunyan'),
	sinon         = require('sinon'),
	expect        = require('chai').expect,
	BunyanFogbugz = require('../lib/bunyan_fogbugz');

var SHALLOW_LEAF = 'shallow-leaf-marker';
var DEEP_LEAF = 'deep-leaf-marker';

// Pretty-printed output of an overflowing record is far larger than this.
// A depth-limited serialization or a placeholder fits under it.
var MAX_BOUNDED_EXTRA = 100000;

if (process.env.BUNYAN_FOGBUGZ_NESTING_CHILD === '1') {
	runNestingChild();
}

function nest(depth, leaf, shape) {
	var obj = shape === 'array' ? [leaf] : {leaf: leaf};
	for (var i = 0; i < depth; i++) {
		obj = shape === 'array' ? [obj] : {child: obj};
	}
	return obj;
}

function depthThatOverflowsStringify(shape) {
	var depth = 256;
	while (depth <= 2000000) {
		try {
			JSON.stringify(nest(depth, DEEP_LEAF, shape));
		} catch (err) {
			if (err && err.name === 'RangeError') {
				return depth;
			}
			throw err;
		}
		depth *= 2;
	}
	throw new Error('JSON.stringify did not raise RangeError for ' + shape);
}

function fogbugzOptions() {
	return {
		user: 'user-name',
		project: 'project-name',
		area: 'area-name',
		domain: 'https://example.invalid',
		email: 'placeholder@example.invalid',
		forceNewBug: false
	};
}

function createStream() {
	var stream = new BunyanFogbugz(fogbugzOptions());
	var sandbox = sinon.sandbox.create();
	var submit = sandbox.stub(stream.bugzscout, 'submit');
	return {stream: stream, submit: submit, sandbox: sandbox};
}

function rawLogger(stream) {
	return bunyan.createLogger({
		name: 'app',
		streams: [{
			stream: stream,
			type: 'raw',
			level: 'error'
		}]
	});
}

function assertBoundedReport(submit, message, leaf) {
	expect(submit.called, 'bugzscout.submit was not called').to.equal(true);
	var report = submit.lastCall.args[0];
	expect(report.description, 'description').to.be.a('string').and.to.contain(message);
	var extra = report.extra;
	var bounded = extra == null || extra === '' ||
		(typeof extra === 'string' &&
			extra.indexOf(leaf) === -1 &&
			extra.length < MAX_BOUNDED_EXTRA);
	expect(bounded, 'extra should be omitted, a placeholder, or depth-limited, got ' +
		(typeof extra === 'string' ? extra.slice(0, 180) : typeof extra)).to.equal(true);
}

function runNestingChild() {
	var shape = process.env.NEST_SHAPE === 'array' ? 'array' : 'object';
	var depth = parseInt(process.env.NEST_DEPTH, 10);
	var field = process.env.NEST_FIELD || 'payload';
	var fields = {};
	fields[field] = nest(depth, DEEP_LEAF, shape);

	var stream = new BunyanFogbugz(fogbugzOptions());
	stream.bugzscout.submit = function (report) {
		var extra = report && report.extra;
		var bounded = extra == null || extra === '' ||
			(typeof extra === 'string' &&
				extra.indexOf(DEEP_LEAF) === -1 &&
				extra.length < MAX_BOUNDED_EXTRA);
		if (!bounded) {
			console.log('EXTRA_UNBOUNDED');
			process.exit(3);
		}
		console.log('SUBMIT_CALLED');
	};

	var log = rawLogger(stream);
	log.error(fields, 'request failed');
	console.log('CHILD_OK');
	process.exit(0);
}

describe('deeply nested log records', function () {
	this.timeout(20000);

	var objectDepth;
	var arrayDepth;

	before(function () {
		objectDepth = depthThatOverflowsStringify('object');
		arrayDepth = depthThatOverflowsStringify('array');
	});

	function spawnLogger(env) {
		var childEnv = {};
		Object.keys(process.env).forEach(function (key) {
			childEnv[key] = process.env[key];
		});
		childEnv.BUNYAN_FOGBUGZ_NESTING_CHILD = '1';
		Object.keys(env).forEach(function (key) {
			childEnv[key] = env[key];
		});
		return childProcess.spawnSync(process.execPath, [path.join(__dirname, 'deep_nesting_test.js')], {
			env: childEnv,
			encoding: 'utf8',
			timeout: 15000
		});
	}

	it('still records a shallow nested object through the raw stream', function () {
		var created = createStream();
		var log = rawLogger(created.stream);
		expect(function () {
			log.error({payload: nest(4, SHALLOW_LEAF, 'object')}, 'request failed');
		}).to.not.throw();
		expect(created.submit.calledOnce).to.equal(true);
		var report = created.submit.lastCall.args[0];
		expect(report.description).to.contain('request failed');
		expect(report.extra).to.be.a('string');
		expect(report.extra).to.contain(SHALLOW_LEAF);
		expect(report.extra).to.contain('request failed');
		created.sandbox.restore();
	});

	it('does not throw from write when the record contains a deeply nested object', function () {
		var created = createStream();
		var record = {
			name: 'app',
			level: 50,
			msg: 'request failed',
			time: new Date(),
			v: 0,
			payload: nest(objectDepth, DEEP_LEAF, 'object')
		};
		expect(function () {
			created.stream.write(record);
		}).to.not.throw();
		assertBoundedReport(created.submit, 'request failed', DEEP_LEAF);
		created.sandbox.restore();
	});

	it('does not throw from write when the record contains a deeply nested array', function () {
		var created = createStream();
		var record = {
			name: 'app',
			level: 50,
			msg: 'request failed',
			time: new Date(),
			v: 0,
			payload: nest(arrayDepth, DEEP_LEAF, 'array')
		};
		expect(function () {
			created.stream.write(record);
		}).to.not.throw();
		assertBoundedReport(created.submit, 'request failed', DEEP_LEAF);
		created.sandbox.restore();
	});

	it('does not throw when the nested object is logged on err', function () {
		var created = createStream();
		var log = rawLogger(created.stream);
		expect(function () {
			log.error({err: nest(objectDepth, DEEP_LEAF, 'object')}, 'request failed');
		}).to.not.throw();
		assertBoundedReport(created.submit, 'request failed', DEEP_LEAF);
		created.sandbox.restore();
	});

	it('does not exit the process when a raw error log carries a deeply nested object', function () {
		var result = spawnLogger({
			NEST_DEPTH: String(objectDepth),
			NEST_SHAPE: 'object',
			NEST_FIELD: 'payload'
		});
		expect(result.stdout || '').to.contain('SUBMIT_CALLED');
		expect(result.stdout || '').to.contain('CHILD_OK');
		expect(result.status, (result.stderr || '') + (result.stdout || '')).to.equal(0);
	});

	it('does not exit the process when a raw error log carries a deeply nested array', function () {
		var result = spawnLogger({
			NEST_DEPTH: String(arrayDepth),
			NEST_SHAPE: 'array',
			NEST_FIELD: 'payload'
		});
		expect(result.stdout || '').to.contain('SUBMIT_CALLED');
		expect(result.stdout || '').to.contain('CHILD_OK');
		expect(result.status, (result.stderr || '') + (result.stdout || '')).to.equal(0);
	});
});
