var commander = require('commander'),
	fs = require('fs');

/*
	example options object:
	{
		option1: {
			charater: 'o',
			argument: 'value',
			defaultValue: '',
			description: 'an option',
			required: true,
			type: Boolean
		},
		options2: {
			charater: 'O',
			argument: 'value',
			defaultValue: 10,
			description: 'another option'
		}
	}
*/
module.exports = function (options, appVersion) {
	if (!options || !appVersion) {
		throw new Error('Missing arguments');
	}
	commander
		.version(appVersion)
		.usage('[options]');

	var config = {},
		option,
		optName,
		requiredText,
		description,
		longOptionStr,
		configFile = {},
		character,
		allCharacters = 'abcdefgijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUWXYZ',
		usedCharacters = { h: true, V: true },
		traverseObject = function (obj, path) {
			var parts = path.split('.'),
				result = obj;
			parts.forEach(function (part) {
				result = result[part];
			});
			return result;
		},
		getCharacterForOption = function (optName) {
			var i, moreChars, ch;
			// try the first character in the option name
			if (!usedCharacters[optName[0]]) {
				ch = optName[0];
			}
			// try the first character in the option name (upper case)
			else if (!usedCharacters[optName[0].toUpperCase()]) {
				ch = optName[0].toUpperCase();
			}
			else {
				// try the any of the upper case letters in the option name
				moreChars = optName.match(/[A-Z]/g);
				if (moreChars) {
					for (i = 0; i < moreChars.length; i++) {
						if (!usedCharacters[moreChars[i].toLowerCase()]) {
							ch = moreChars[i].toLowerCase();
							break;
						}
						else if (!usedCharacters[moreChars[i]]) {
							ch = moreChars[i];
							break;
						}
					}
				}
				if (!ch) {
					// try the any character in the option name
					for (i = 1; i < optName.length; i++) {
						if (!usedCharacters[optName[i].toLowerCase()]) {
							ch = optName[i].toLowerCase();
							break;
						}
						else if (!usedCharacters[optName[i].toUpperCase()]) {
							ch = optName[i].toUpperCase();
							break;
						}
					}
					// pick any character from the alphabet that hasn't been used
					if (!ch) {
						for (i = 1; i < allCharacters.length; i++) {
							if (!usedCharacters[allCharacters[i]]) {
								ch = allCharacters[i];
								break;
							}
						}
						// uh oh
						if (!ch) {
							throw new Error('There are no valid characters left. Consider reducing the number of options you have.');
						}
					}
				}
			}
			usedCharacters[ch] = true;
			return ch;
		};

	for (optName in options) {
		if (options.hasOwnProperty(optName)) {
			option = options[optName];
			if (option.hasOwnProperty('character')) {
				if (usedCharacters[option.character]) {
					throw new Error('More than one option is attempting to use the same character ("' + option.character + '"). Please choose unique characters for your options.');
				}
				usedCharacters[option.character] = true;
			}
		}
	}
	for (optName in options) {
		if (options.hasOwnProperty(optName)) {
			option = options[optName];
			if (!option.argument && option.hasOwnProperty('type') && option.type !== Boolean) {
				throw new Error('Please specify an "argument" property if declaring the "type" as anything other than Boolean');
			}
			requiredText = (option.required) ? '(Required) ' : '(Optional) ';
			description = option.description || 'No Description.';
			description = requiredText + description;
			if (option.hasOwnProperty('defaultValue') && option.defaultValue !== null) {
				description += ' Defaults to: ';
				description += (typeof(option.defaultValue) === 'string') ? '"' + option.defaultValue + '"' : option.defaultValue;
			}
			longOptionStr = optName.replace(/([A-Z])/g, function (match) { return "-" + match.toLowerCase(); });
			var argOpenChar = (option.required) ? '<' : '[',
				argCloseChar = (option.required) ? '>' : ']';
			longOptionStr = (option.argument) ? longOptionStr + ' ' + argOpenChar + option.argument + argCloseChar : longOptionStr;

			// if no argument was specified, then this is a boolean flag, and therefore should default to false, if not specified otherwise
			if (!option.argument) {
				option.defaultValue = option.defaultValue || false;
			}
			// if no character was supplied, let's try to pick one
			if (!option.hasOwnProperty('character')) {
				character = getCharacterForOption(optName);
			}
			else {
				character = option.character;
			}

			commander.option('-' + character + ', --' + longOptionStr, description);
			
		}
	}

	// parse options form arguments
	commander.parse(process.argv);

	// look for opter.json as a sibling to the file currently being executed
	if (process.argv[1]) {
		configFile = process.argv[1].substr(0, process.argv[1].lastIndexOf('/') + 1) + 'opter.json';
		try {
			fs.statSync(configFile);
			configFile = require(configFile);
		}
		catch (ex) {
			configFile = {};
		}
	}
	
	// save options to config obj (from command line first, env vars second, opter.json third, and defaults last)
	for (optName in options) {
		if (options.hasOwnProperty(optName)) {
			option = options[optName];
			config[optName] = commander[optName] || process.env[optName.replace(/\./g, '_')] || traverseObject(configFile, optName) || option.defaultValue;
			if (option.hasOwnProperty('type')) {
				switch (option.type) {

				case Boolean:
					config[optName] = (config[optName] === "true") || (config[optName] === true);
					break;

				case Number:
					// fastest, most reliable way to convert a string to a valid number
					config[optName] = 1 * config[optName];
					break;

				case Date:
					// test string to see if it's an all-numeric value, and if so, parse it
					config[optName] = (/^\d+$/.test(config[optName])) ? 1 * config[optName] : config[optName];
					config[optName] = new Date(config[optName]);
					break;

				default:
					config[optName] = (config[optName] !== null && config[optName] !== undefined) ? config[optName].toString() : config[optName];
				}
				
			}
			if (config[optName] === undefined && option.required) {
				throw new Error('Option "' + optName + '" is not set and is required.');
			}
		}
	}
	return config;
};