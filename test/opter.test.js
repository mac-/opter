var assert = require('assert'),
	opter = require('../lib-test/opter.js'),
	commander = {
		optString: '',
		optDescription: '',
		myOptionFromArgs: 'args',
		version: function(ver) {
			return this;
		},
		usage: function() { return this; },
		option: function(str, desc) {
			this.optString = str;
			this.optDescription = desc;
			return this;
		},
		parse: function() {
		}
	},
	_ = require('underscore');

describe('Opter Unit Tests', function() {

	it('should throw an error', function(done) {
		assert.throws(opter, /Missing/, 'throws missing arguments error');
		done();
	});

	it('should throw an error when 2 or more options use the same character', function(done) {
		
		assert.throws(function() {
			var cfg = opter({
				optA: {
					character: 'a'
				},
				optB: {
					character: 'a'
				}
			}, '0.1.0', commander);
		}, /More than one option is attempting/, 'throws duplicate character error');
		done();
	});

	it('should read values from args', function(done) {
		
		process.env.myOptionFromArgs = 'env';
		var cfg = opter({
			myOptionFromArgs: {
				defaultValue: 'default'
			}
		}, '0.1.0', commander);
		assert.strictEqual(cfg.myOptionFromArgs, 'args', 'myOptionFromArgs is: args');
		done();
	});

	it('should read values from env', function(done) {
		
		process.env.myOptionFromEnv = 'env';
		var cfg = opter({
			myOptionFromEnv: {
				defaultValue: 'default'
			}
		}, '0.1.0', commander);
		assert.strictEqual(cfg.myOptionFromEnv, 'env', 'myOptionFromEnv is: env');
		done();
	});

	it('should read values from env', function(done) {
		
		var cfg = opter({
			myOptionFromDefault: {
				defaultValue: 'default'
			}
		}, '0.1.0', commander);
		assert.strictEqual(cfg.myOptionFromDefault, 'default', 'myOptionFromDefault is: default');
		done();
	});

	it('should set options and description', function(done) {
		
		var cfg = opter({
			myOptionFromDefault: {
				character: 'd',
				argument: 'string',
				description: 'some description.',
				defaultValue: 'default'
			}
		}, '0.1.0', commander);
		assert.strictEqual(commander.optString, '-d, --my-option-from-default <string>', 'option string should show short option, long option, and argument');
		assert.strictEqual(commander.optDescription, 'some description. Defaults to: "default"', 'description should show description and default value');
		done();
	});

	it('should set options and description without default and argument', function(done) {
		
		var cfg = opter({
			myOptionFromDefault: {
				character: 'd',
				description: 'some description.'
			}
		}, '0.1.0', commander);
		assert.strictEqual(commander.optString, '-d, --my-option-from-default', 'option string should show short option and long option');
		assert.strictEqual(commander.optDescription, 'some description.', 'description should show description');
		done();
	});

	it('should automatically pick a character', function(done) {
		
		var cfg = opter({
			myOptionFromDefault: { },
			mySecondOption: { },
			mySixthOption: { }
		}, '0.1.0', commander);
		assert.strictEqual(commander.optString, '-s, --my-sixth-option', 'option string should show short option as "s"');

		cfg = opter({
			myOptionFromDefault: { },
			mySecondOption: { },
			mySixthOption: { },
			mySeventhOption: { }
		}, '0.1.0', commander);
		assert.strictEqual(commander.optString, '-S, --my-seventh-option', 'option string should show short option as "S"');

		cfg = opter({
			myOptionFromDefault: { },
			mySecondOption: { },
			mySixthOption: { },
			mySeventhOption: { },
			mySixteenthOption: { },
			mySeventeenthOption: { },
			myStupidOption: { }
		}, '0.1.0', commander);
		assert.strictEqual(commander.optString, '-y, --my-stupid-option', 'option string should show short option as "y"');

		cfg = opter({
			optA: { },
			optAa: { },
			optAaa: { },
			optAaaa: { },
			optAaaaa: { },
			optAaaaaa: { },
			optAaaaaaa: { },
			optAaaaaaaa: { },
			optAaaaaaaaa: { }
		}, '0.1.0', commander);
		assert.strictEqual(commander.optString, '-b, --opt-aaaaaaaaa', 'option string should show short option as "b"');

		done();
	});


});