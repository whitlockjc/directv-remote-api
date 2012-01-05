$(document).ready(function() {
    var validIPAddress = prompt('Please enter a known valid IP address of an accessible DirecTV set-top-box');

    module('DirecTV.Remote()');

    test('DirecTV.Remote()', function() {
        var dtvr;

        raises(function() {
            dtvr = new DirecTV.Remote();
        }, 'Should not be able to create a DirecTV.Remote without the ipAddress option.');

        dtvr = new DirecTV.Remote({ipAddress: validIPAddress});
    });

    module('DirecTV.Remote.validate()');

    asyncTest('DirecTV.Remote.validate() [invalid ip address]', function() {
        var dtvr = new DirecTV.Remote({ipAddress: '192.168.0.1'});

        raises(function() {
            dtvr.validate();
        }, 'Validation should not run if a callback is not supplied.');

        dtvr.validate({callback: function(result) {
            ok(result.status.code !== 200, 'Validation result should be negative.');
            start();
        }});
    });

    asyncTest('DirecTV.Remote.validate()', function() {
        var dtvr = new DirecTV.Remote({ipAddress: validIPAddress});

        dtvr.validate({callback: function(result) {
            ok(result.status.code === 200, 'Validation result should be positive.');
            start();
        }});
    });

    module('DirecTV.Remote.getLocations()');

    asyncTest('DirecTV.Remote.getLocations()', function() {
        var dtvr = new DirecTV.Remote({ipAddress: validIPAddress});

        dtvr.getLocations({callback: function(result) {
            ok(result.locations && result.locations.length >= 1, 'At least one location should be returned.');
            start();
        }});
    });

    module('DirecTV.Remote.getMode()');

    asyncTest('DirecTV.Remote.getMode()', function() {
        var dtvr = new DirecTV.Remote({ipAddress: validIPAddress});

        dtvr.getMode({callback: function(result) {
            ok(_.contains(_.keys(result), 'mode'), 'Expects response key mode.');

            start();
        }});
    });

    module('DirecTV.Remote.getVersion()');

    asyncTest('DirecTV.Remote.getVersion()', function() {
        var dtvr = new DirecTV.Remote({ipAddress: validIPAddress});
        var expectedKeys = ['accessCardId', 'receiverId', 'stbSoftwareVersion', 'systemTime', 'version'];
        var keys;
        var key;
        var i;

        dtvr.getVersion({callback: function(result) {
            keys = _.keys(result);

            for (i = 0; i < expectedKeys.length; i++) {
                key = expectedKeys[i];

                ok(_.contains(keys, key), 'Expected response key (' + key + ') found.');
            }

            start();
        }});
    });

    module('DirecTV.Remote.processKey()');

    asyncTest('DirecTV.Remote.processKey() [invalid key]', function() {
        var dtvr = new DirecTV.Remote({ipAddress: validIPAddress});

        dtvr.processKey({key: 'exitt', callback: function(result) {
            ok(result.status.code !== 200, 'Invalid key should result in invalid response.');

            start();
        }});
    });

    asyncTest('DirecTV.Remote.processKey() [invalid hold]', function() {
        var dtvr = new DirecTV.Remote({ipAddress: validIPAddress});

        dtvr.processKey({key: 'exit', hold: 'keyPresss', callback: function(result) {
            ok(result.status.code !== 200, 'Invalid key should result in invalid response.');

            start();
        }});
    });

    asyncTest('DirecTV.Remote.processKey()', function() {
        var dtvr = new DirecTV.Remote({ipAddress: validIPAddress});
        var expectedKeys = ['hold', 'key'];
        var keys;
        var key;
        var i;

        dtvr.processKey({key: 'exit', callback: function(result) {
            keys = _.keys(result);

            for (i = 0; i < expectedKeys.length; i++) {
                key = expectedKeys[i];

                ok(_.contains(keys, key), 'Expected response key (' + key + ') found.');

                if (key === 'key') {
                    ok('exit' === result.key, 'Key sent should be the key received.');
                }

                if (key === 'hold') {
                    ok('keyPress' === result.hold, 'Default hold (keyPress) should be received.');
                }
            }

            start();
        }});
    });

    module('DirecTV.Remote.processCommand()');

    asyncTest('DirecTV.Remote.processCommand() [invalid cmd]', function() {
        var dtvr = new DirecTV.Remote({ipAddress: validIPAddress});

        dtvr.processCommand({cmd: 'FAFA', callback: function(result) {
            ok(result.status.code !== 200, 'Invalid key should result in invalid response.');

            start();
        }});
    });

    asyncTest('DirecTV.Remote.processCommand()', function() {
        var dtvr = new DirecTV.Remote({ipAddress: validIPAddress});
        var expectedKeys = ['command', 'param', 'prefix', 'return'];
        var keys;
        var key;
        var i;

        dtvr.processCommand({cmd: 'FA83', callback: function(result) {
            keys = _.keys(result);

            for (i = 0; i < expectedKeys.length; i++) {
                key = expectedKeys[i];

                ok(_.contains(keys, key), 'Expected response key (' + key + ') found.');

                if (key === 'command') {
                    ok(true === result.command, 'Command value should be true.');
                }
            }

            start();
        }});
    });

    module('DirecTV.Remote.getOptions()');

    asyncTest('DirecTV.Remote.getOptions()', function() {
        var dtvr = new DirecTV.Remote({ipAddress: validIPAddress});

        dtvr.getOptions({callback: function(results) {
            ok(8 === results.options.length, 'There should be 8 commands available.');

            start();
        }});
    });

    module('DirecTV.Remote.getProgInfo()');

    asyncTest('DirecTV.Remote.getProgInfo() [invalid major]', function() {
        var dtvr = new DirecTV.Remote({ipAddress: validIPAddress});

        dtvr.getProgInfo({major: '55555', callback: function(result) {
            ok(result.status.code !== 200, 'Invalid key should result in invalid response.');

            start();
        }});
    });

    asyncTest('DirecTV.Remote.getProgInfo()', function() {
        var dtvr = new DirecTV.Remote({ipAddress: validIPAddress});
        var expectedKeys = ['callsign', 'date', 'duration', 'episodeTitle', 'isOffAir', 'isPclocked',
                            'isPpv', 'isRecording', 'isVod', 'major', 'minor', 'programId', 'rating',
                            'startTime', 'stationId', 'title'];
        var keys;
        var key;
        var i;

        dtvr.getProgInfo({major: '299', callback: function(result) {
            keys = _.keys(result);

            for (i = 0; i < expectedKeys.length; i++) {
                key = expectedKeys[i];

                ok(_.contains(keys, key), 'Expected response key (' + key + ') found.');

                if (key === 'major') {
                    ok(result.major === 299, 'Major sent should be the major received.');
                }
            }

            start();
        }});
    });

    module('DirecTV.Remote.getTuned()');

    asyncTest('DirecTV.Remote.getTuned()', function() {
        var dtvr = new DirecTV.Remote({ipAddress: validIPAddress});
        var expectedKeys = ['callsign', 'date', 'duration', 'isOffAir', 'isPclocked', 'isPpv',
                            'isRecording', 'isVod', 'major', 'minor', 'offset', 'programId',
                            'rating', 'startTime', 'stationId', 'title'];
        var keys;
        var key;
        var i;

        dtvr.getTuned({callback: function(result) {
            keys = _.keys(result);

            for (i = 0; i < expectedKeys.length; i++) {
                key = expectedKeys[i];

                ok(_.contains(keys, key), 'Expected response key (' + key + ') found.');
            }

            start();
        }});
    });

    module('DirecTV.Remote.tune()');

    asyncTest('DirecTV.Remote.tune() [invalid major]', function() {
        var dtvr = new DirecTV.Remote({ipAddress: validIPAddress});

        dtvr.tune({major: '55555', callback: function(result) {
            ok(200 !== result.status.code, 'Invalid major should result in invalid response.');

            start();
        }});
    });

    asyncTest('DirecTV.Remote.tune()', function() {
        var dtvr = new DirecTV.Remote({ipAddress: validIPAddress});

        dtvr.getTuned({callback: function(result) {
            dtvr.tune({major: result.major, callback: function(xresult) {
                ok(200 === xresult.status.code, 'Tuning to a valid channel.');

                start();
            }});
        }});
    });
});
