var commander = require('commander');

/*
	example options object:
	{
		option1: {
			charater: 'o',
			argument: 'value',
			defaultValue: '',
			description: 'an option'
		},
		options2: {
			charater: 'O',
			argument: 'value',
			defaultValue: 10,
			description: 'another option'
		}
	}
*/
// allow for instances of commander to be injected to support unit testing
module.exports = function (options, appVersion, c) {
	if (!options || !appVersion) {
		throw new Error('Missing arguments');
	}
	if (c && c.version && c.usage && c.parse && c.option) {
		commander = c;
	}
	commander
		.version(appVersion)
		.usage('[options]');

	var config = {},
		option,
		optName,
		description,
		longOptionStr,
		character,
		allCharacters = 'abcdefgijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUWXYZ',
		usedCharacters = { h: true, V: true },
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
			description = option.description || 'No Description.';
			if (option.hasOwnProperty('defaultValue') && option.defaultValue !== null) {
				description += ' Defaults to: ';
				description += (typeof(option.defaultValue) === 'string') ? '"' + option.defaultValue + '"' : option.defaultValue;
			}
			longOptionStr = optName.replace(/([A-Z])/g, function (match) { return "-" + match.toLowerCase(); });
			longOptionStr = (option.argument) ? longOptionStr + ' <' + option.argument + '>' : longOptionStr;

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

	// save options to config obj (from command line first, env vars second, and defaults last)
	for (optName in options) {
		if (options.hasOwnProperty(optName)) {
			option = options[optName];
			config[optName] = commander[optName] || process.env[optName] || option.defaultValue;
		}
	}

	return config;
};