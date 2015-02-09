#Bunyan-Fogbugz
[![bunyan-fogbugz](http://img.shields.io/npm/v/bunyan-fogbugz.svg?style=flat-square)](https://www.npmjs.com/package/bunyan-fogbugz)
[![bunyan-fogbugz](http://img.shields.io/npm/dm/bunyan-fogbugz.svg?style=flat-square)](https://www.npmjs.com/package/bunyan-fogbugz)
[![bunyan-fogbugz](http://img.shields.io/npm/l/bunyan-fogbugz.svg?style=flat-square)](https://www.npmjs.com/package/bunyan-fogbugz)
[![Build fogbugz](https://img.shields.io/travis/qualitybath/bunyan-fogbugz.svg?style=flat-square)](https://travis-ci.org/qualitybath/bunyan-fogbugz)
[![Coveralls](https://img.shields.io/coveralls/qualitybath/bunyan-fogbugz.svg?style=flat-square)](https://coveralls.io/r/qualitybath/bunyan-fogbugz)
[![code climate](https://img.shields.io/codeclimate/github/qualitybath/bunyan-fogbugz.svg?style=flat-square)](https://codeclimate.com/github/qualitybath/bunyan-fogbugz)

**Bunyan stream for sending automated crash reports to FogBugz**


First install bunyan...

```
npm install bunyan
```

Then install bunyan-fogbugz

```
npm install bunyan-fogbugz
```

##Basic Setup

```javascript
var bunyan  = require("bunyan"),
	BunyanFogbugz = require('bunyan-fogbugz'),
	log;

log = bunyan.createLogger({
	name: "myApp",
	stream: new BunyanFogbugz({
		user: "user-name",
		project: "project-name",
		area: "area-name",
		domain: "your-fogbugz-domain-name",
		email: "email",
		forceNewBug: false
	}),
	level: "error"
});

log.error("hello bunyan fogbugz");
```
##Custom Formatters

By default the logs are formatted like so: `[LOG_LEVEL] message`, unless you specify a `customFormatter` function (which you should).

```javascript
	log = bunyan.createLogger({
	name: "myApp",
	stream: new BunyanFogbugz({
		user: "user-name",
		project: "project-name",
		area: "area-name",
		domain: "your-fogbugz-domain-name",
		email: "email",
		forceNewBug: false
		customFormatter: function(record, levelName){
			return {description: "[" + levelName + "] " + record.msg }
		}
	}),
	level: "error"
});
```

###Available Constructor Options
* `domain` (required)
* `user` (required)
* `project` (required)
* `area` (required)
* `forceNewBug` (defaults to `false`)
* `email`


###Custom Formatter Options
* `description` (required)
* `extra`
* `defaultMessage`

For more info on the BugzScout API see [bugzscout for automatic crash reportings](http://help.fogcreek.com/7566/bugzscout-for-automatic-crash-reporting)


## Authors
* [Seth Pollack](https://github.com/sethpollack)

***
The MIT License  
Copyright (c) 2015 [QualityBath.com](https://www.qualitybath.com/)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

