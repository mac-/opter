# opter

Opter provides an easy way to specify options for your application. It uses [commander](https://github.com/visionmedia/commander.js) to parse command line arguments and display option help information. In addition to reading from command line options, it can also read values from environment variables and a json file (opter.json) that lives in the same directory as the file being run by NodeJS. If no values were found in the command line arguments, environment variables, or the opter.json file, then it will assign the default value (if provided). The priority is:

1. command line args
2. environment variables
3. opter.json file
4. default value

[![Build Status](https://secure.travis-ci.org/mac-/opter.png)](http://travis-ci.org/mac-/opter)
[![NPM version](https://badge.fury.io/js/opter.png)](http://badge.fury.io/js/opter)
[![Dependency Status](https://david-dm.org/mac-/opter.png)](https://david-dm.org/mac-/opter)

[![NPM](https://nodei.co/npm/opter.png?downloads=true&stars=true)](https://nodei.co/npm/opter/)

## Installation

	npm install opter

## Usage

The opter function takes two parameters:

* An object containing the options to configure
* The version of your app (easily retrieved by running ```require('./package.json').version```)

The object containing the options should be formatted like so:

	{
		myOption: {		// correlates to command line option "--my-option" or environment variable "myOption" or opter.json property "myOption"
			character: 'm',		// optional, used as the short option for the command line. If not provided opter will try to pick one for you based on your option name.
			argument: 'string',		// optional, describes what the value should be
			defaultValue: 'fnord',	// optional, the value to set the option to if it wasn't specified in the args or env vars
			description: 'Some description', // optional, describes the option,
			required: true, // optional, if set to true and no value is found, opter will throw an error. defaults to false.
			type: Number // optional, the type to convert the data to. valid values are Boolean, Number, Date, and String. defaults to String.
		}
	}

The function returns an object containing the keys that were specified in the options that were passed along with the values that opter found from the args, env vars, or default values. For example, calling the opter function with the above sample options object, the result might look like:

	{
		myOption: 'fnord'
	}

Here is an example on how to use opter:

	// app.js
	var opter = require('opter'),
		appVersion = require('./package.json').version,
		opts = {
			myOption: {}
		},
		options = opter(opts, appVersion);

With the example above, here are some sample ways to invoke the app:

	$ node app.js -m test
	$ node app.js --my-option test
	$ export myOption=test && node app.js
	$ node app.js -h
	$ node app.js -V

When an app using opter is run with the "-h" option, something similar will be displayed in the console:

```
$ node app.js -h

  Usage: app.js [options]

  Options:

    -h, --help                          output usage information
    -V, --version                       output the version number
    -m, --my-option <value>             (Optional) Enables some cool funcitonality. Defaults to: true
```

Here is an example opter.json file:

	{
		"myOption": "fnord"
	}

## License

The MIT License (MIT) Copyright (c) 2013 Mac Angell

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
