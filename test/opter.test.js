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
		
		process.env.myOptionFromArgs1 = 'args1';
		process.env.myOptionFromArgs2 = 'args2';
		var cfg = opter({
			myOptionFromArgs1: {
				defaultValue: 'default1'
			},
			myOptionFromArgs2: {
				defaultValue: 'default2'
			}
		}, '0.1.0', commander);
		assert.strictEqual(cfg.myOptionFromArgs1, 'args1', 'myOptionFromArgs1 is: args1');
		assert.strictEqual(cfg.myOptionFromArgs2, 'args2', 'myOptionFromArgs2 is: args2');
		done();
	});

	it('should read values from env', function(done) {
		
		process.env.myOptionFromEnv1 = 'env1';
		process.env.myOptionFromEnv2 = 'env2';
		var cfg = opter({
			myOptionFromEnv1: {
				defaultValue: 'default1'
			},
			myOptionFromEnv2: {
				defaultValue: 'default2'
			}
		}, '0.1.0', commander);
		assert.strictEqual(cfg.myOptionFromEnv1, 'env1', 'myOptionFromEnv1 is: env1');
		assert.strictEqual(cfg.myOptionFromEnv2, 'env2', 'myOptionFromEnv2 is: env2');
		done();
	});

	it('should read values from default value', function(done) {
		
		var cfg = opter({
			myOptionFromDefault1: {
				defaultValue: 'default1'
			},
			myOptionFromDefault2: {
				defaultValue: 'default2'
			}
		}, '0.1.0', commander);
		assert.strictEqual(cfg.myOptionFromDefault1, 'default1', 'myOptionFromDefault1 is: default1');
		assert.strictEqual(cfg.myOptionFromDefault2, 'default2', 'myOptionFromDefault2 is: default2');
		done();
	});

	it('should read values from mixed places', function(done) {

		process.env.myOptionFromArgs1 = 'args1';
		process.env.myOptionFromEnv1 = 'env1';
		var cfg = opter({
			myOptionFromArgs1: {
				defaultValue: 'default1'
			},
			myOptionFromEnv1: {
				defaultValue: 'default2'
			},
			myOptionFromDefault1: {
				defaultValue: 'default3'
			}
		}, '0.1.0', commander);
		assert.strictEqual(cfg.myOptionFromArgs1, 'args1', 'myOptionFromArgs1 is: args1');
		assert.strictEqual(cfg.myOptionFromEnv1, 'env1', 'myOptionFromEnv1 is: env1');
		assert.strictEqual(cfg.myOptionFromDefault1, 'default3', 'myOptionFromDefault1 is: default3');
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