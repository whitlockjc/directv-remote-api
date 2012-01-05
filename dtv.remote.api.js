// dtv.remote.api.js 0.0.1
//
//     Copyright 2011 Jeremy Whitlock
//
//     Licensed under the Apache License, Version 2.0 (the "License");
//     you may not use this file except in compliance with the License.
//     You may obtain a copy of the License at
//
//         http://www.apache.org/licenses/LICENSE-2.0
//
//     Unless required by applicable law or agreed to in writing, software
//     distributed under the License is distributed on an "AS IS" BASIS,
//     WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//     See the License for the specific language governing permissions and
//     limitations under the License.

// dtv.remote.api.js is a client for the [DirecTV](http://www.directv.com "DirecTV Homepage")
// remote control API.  The purpose of this module is to provide full access
// all available HTTP API endpoints known.  Since DirecTV does not provide any
// official/public documentation, this effort was made possible by two documents
// available online:
//
// *   [DirecTV SHEF Command Set Public Beta](http://www.sbcatest.com/TechUpdates/DTV-MD-0359-DIRECTV%20SHEF%20Public%20Beta%20Command%20Set-V1.0.pdf) <a name="dtv_shef_pdf"/>
// *   [DirecTV Set-Top-Box Information for the Installer](http://www.sbcatest.com/DTV-MD-0058-DIRECTVSet-topInformationforInstallers-V2.2.pdf) <a name="dtv_installer_pdf"/>

(function() {

    // Initialization
    // --------------

    // Establish the root object, `window` in the browser, or `global` on the server.
    var root = this;

    // Save the previous value of the `DirecTV` variable.
    var previousDirecTV = root.DirecTV;

    // The top-level namespace. All public DirecTV classes and modules will
    // be attached to this.
    //
    // **Note:** This needs to be exported for [CommonJS](http://www.commonjs.org/ "CommonJS Homepage")
    //           and [Node.js](http://nodejs.org "Node.js Homepage").
    var DirecTV = root.DirecTV = {};

    // [Underscore](http://documentcloud.github.com/underscore/ "Underscore.js Homepage") owns the `_` variable.
    var _ = root._;

    // [jQuery](http://jquery.com/ "jQuery Homepage") owns the `$` variable.
    //
    // **Note:** This needs to be handled on the server-side via a special object.
    var $ = root.jQuery;

    // Current version number.
    DirecTV.VERSION = '0.0.1';

    // Run DirecTV in *noConflict* mode, returning the previous value of
    // DirecTV.
    DirecTV.noConflict = function() {
        root.DirecTV = previousDirecTV;
        return this;
    };

    // This is **the** DirecTV remote object.  The options object *must* have an
    // `ipAddress` attribute that is a valid IP address for a DirecTV
    // set-top-box.  An `Error` will be thrown if the `ipAddress` attribute is
    // not passed.  No validation of the `ipAddress` occurs at this stage nor is
    // validation automatic.  If you wish to validate the `ipAddress`, use the
    // [DirecTV.Remote.validate()](#validate) method.
    DirecTV.Remote = function(options) {
        options || (options = {}); // Default options to an empty object if not supplied

        // Require that the `ipAddress` option be passed _(unvalidated)_.
        if (!options.ipAddress) {
            throw new Error('options.ipAddress is not optional.');
        }

        // Create a unique identifier
        this.rid = _.uniqueId('dtvr');
        this.ipAddress = options.ipAddress;
    };

    // Attach all inheritable methods to the Remote prototype.
    _.extend(DirecTV.Remote.prototype, {

        // <a name="commands"/>
        // These commands are based on the documentation listed in the
        // [DirecTV Set-Top-Box Information for the Installer](#dtv_installer_pdf)
        // document.  Since this document was generated in 2008, I am sure this
        // list could be out of date but for now I can only add what is
        // documented.  This list is here purely for reference.
        Commands : [
            'FA81', // Standby
            'FA82', // Active
            'FA83', // GetPrimaryStatus
            'FA84', // GetCommandVersion
            'FA87', // GetCurrentChannel
            'FA90', // GetSignalQuality
            'FA91', // GetCurrentTime
            'FA92', // GetUserCommand
            'FA93', // EnableUserEntry
            'FA94', // DisableUserEntry
            'FA95', // GetReturnValue
            'FA96', // Reboot
            'FAA5', // SendUserCommand
            'FAA6', // OpenUserChannel
            'FA9A', // GetTuner
            'FA8A', // GetPrimaryStatusMT
            'FA8B', // GetCurrentChannelMT
            'FA9D', // GetSignalQualityMT
            'FA9F', // OpenUserChannelMT
        ],

        // <a name="holds"/>
        // These holds are based on the documentation listed in the
        // [DirecTV SHEF Command Set Public Beta](#dtv_shef_pdf) document.
        // Since this document was generated in 2010, I am sure this list
        // could be out of date but fornow I can only add what is documented.
        // This list is here purely for reference.
        Holds : [
            'keyUp', // Simulates releasing a key
            'keyDown', // Simulates pressing and holding a key
            'keyPress' // Simulates pressing a key and then releasing a key
        ],

        // <a name="keys"/>
        // These keys are based on the documentation listed in the
        // [DirecTV SHEF Command Set Public Beta](#dtv_shef_pdf) document.
        // Since this document was generated in 2010, I am sure this list could
        // be out of date but for now I can only add what is documented.  This
        // list is here purely for reference.
        Keys : [
            'power',
            'poweron',
            'poweroff',
            'format',
            'pause',
            'rew',
            'replay',
            'stop',
            'advance',
            'ffwd',
            'record',
            'play',
            'guide',
            'active',
            'list',
            'exit',
            'back',
            'menu',
            'info',
            'up',
            'down',
            'left',
            'right',
            'select',
            'red',
            'green',
            'yellow',
            'blue',
            'chanup',
            'chandown',
            'prev',
            '0',
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            'dash',
            'enter'
        ],

        // DirecTV.Remote Methods
        // ----------------------
        //
        // All methods in this section are required to pass in a `callback`
        // function in the options for each method invocation.  Since we're
        // using **jsonp** in the browser, which mandates an asynchronous
        // request, the callback is used to handle the request's response.  The
        // response object will either be a valid payload from the DirecTV API
        // call or an object mirroring the `status` object in every DirecTV API
        // response which contains the following attributes:
        //
        //    * **code:** The HTTP status code of the request
        //    * **commandResult:** The result of the command, UNIX style
        //    * **msg:** The human readable message indicating the request status
        //    * **query:** The portion of the request after the port in the URL
        //
        // Every response to every callback will have at least the `status`
        // attribute mentioned above and it will be what you use to check if a
        // request was a succes or failure.

        // <a name="validate"/>
        // Validate the `ipAddress` configured with this DirecTV.Remote
        // instance.  This is done first by using a regular expression to
        // validate that the `ipAddress` is a valid IPv4 IP address.  If that
        // succeeds, we will then try to contact the DirecTV set-top-box.

        validate : function(options) {
            var path = '/info/getOptions';
            var oldCallback;

            if (!/^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/.test(this.ipAddress)) {
                options.callback({
                    status : {
                        code          : 405,
                        commandResult : 1,
                        msg           : 'Not a valid IP address',
                        query         : path
                    }
                });
            }

            // We have to validate the `callback` option here since we have to
            // do some callback juggling so we can deliver customized messages
            // based on the result of the request.
            if (!options.callback || typeof options.callback !== 'function') {
                throw new Error('options.callback is not optional and must be a function.');
            }

            // The callback passed in so we can invoke it later with our
            // customized response object.
            oldCallback = options.callback;

            options.callback = function(data, textStatus, jqXHR) {
                var response;

                if (data.options) {
                    // We got a valid response.
                    response = {
                        status : {
                            code          : 200,
                            commandResult : 0,
                            msg           : 'Host is a DirecTV set-top-box',
                            query         : path
                        }
                    };
                } else {
                    // We got a valid response but it did not have the expected
                    // payload.
                    response = {
                        status : {
                            code          : 404,
                            commandResult : 1,
                            msg           : 'Host does not appear to be a DirecTV set-top-box',
                            query         : path
                        }
                    };
                }

                // Fire the callback with our customized response
                oldCallback(response);
            };

            this.makeRequest({
                path    : path,
                options : options
            });
        },

        // Retrieve the list of DirecTV set-top-box locations the set-top-box
        // is aware of.
        getLocations : function(options) {
            this.makeRequest({
                path    : '/info/getLocations',
                options : options
            });
        },

        // Retrieve the current software version information for the DirecTV
        // set-top-box.
        getVersion : function(options) {
            this.makeRequest({
                path    : '/info/getVersion',
                options : options,
            });
        },

        // Retrieve the operating mode the DirecTV set-top-box is currently
        // operating in.
        getMode : function(options) {
            this.makeRequest({
                path    : '/info/mode',
                options : options
            });
        },

        // Send a remote key press request to the DirecTV set-top-box.  The
        // `key` option is required and must be valid.  For available keys see
        // the [available keys](#keys) portion of the documentaiton.  You can
        // also pass in a `hold` option but it is not required.  For available
        // holds, see the [available holds](#holds) portion of the
        // documentation.
        processKey : function(options) {
            if (options && !options.key) {
                throw new Error('options.key is not optional.');
            }

            this.makeRequest({
                path    : '/remote/processKey',
                options : options
            });
        },

        // Sends a serial command request to the DirecTV set-top-box.  The
        // `cmd` option is required and must be valid.  For available commands
        // see the [available commands](#commands) portion of the documentaiton.
        processCommand : function(options) {
            if (options && !options.cmd) {
                throw new Error('options.cmd is not optional.');
            }

            this.makeRequest({
                path    : '/serial/processCommand',
                options : options
            });
        },

        // Retrieve the list of available APIs the DirecTV set-top-box supports.
        getOptions : function(options) {
            this.makeRequest({
                path    : '/info/getOptions',
                options : options
            });
        },

        // Retrieve the current program information for the channel given.  The
        // `major` option is required and corresponds to the channel you want to
        // get programming information for.
        getProgInfo : function(options) {
            if (options && !options.major) {
                throw new Error('options.major is not optional.');
            }

            this.makeRequest({
                path    : '/tv/getProgInfo',
                options : options
            });
        },

        // Retrieves the current program information for the currently tuned
        // channel.
        getTuned : function(options) {
            this.makeRequest({
                path    : '/tv/getTuned',
                options : options
            });
        },

        // Send a request to tune the DirecTV set-top-box to the channel
        // specified.  The `major` option is required and corresponds to the
        // channel you wish to tune to.
        tune : function(options) {
            if (options && !options.major) {
                throw new Error('options.major is not optional.');
            }

            this.makeRequest({
                path    : '/tv/tune',
                options : options
            });
        },

        // Helper Methods
        // --------------
        //
        // The methods in this section are helper methods.

        makeRequest : function(requestOptions) {
            requestOptions || (requestOptions = {}); // Default options to an empty object if not supplied
            requestOptions.options || (requestOptions.options = {}); // Default options to an empty object if not supplied

            var requestUrl = 'http://' + this.ipAddress + ':8080';
            var requestQuery = requestOptions.path;
            var requestComplete = false;
            // This is the currently known list of available request parameters
            // that can be specified in all DirecTV.Remote methods.
            var knownRequestParams = [
                'clientAddr',
                'cmd',
                'hold',
                'key',
                'major',
                'minor',
                'time',
                'videoWindow',
                'wrapper'
            ];
            var i;

            // This should never happen but just in case someone uses makeRequest directly in an invalid way...
            if (!requestOptions.options.callback || typeof requestOptions.options.callback !== 'function') {
                throw new Error('requestOptions.options.callback is not optional and must be a function.');
            }

            // This should never happen but just in case someone uses makeRequest directly in an invalid way...
            if (!requestOptions.path) {
                throw new Error('requestOptions.path is not optional.');
            }

            // Create query params based on known request options
            if (_.intersection(knownRequestParams, _.keys(requestOptions.options)).length > 0) {
                requestQuery += '?';
            }

            for (i = 0; i < knownRequestParams.length; i++) {
                var requestParam = knownRequestParams[i];

                if (requestOptions.options.hasOwnProperty(requestParam)) {
                    if (requestQuery.charAt(requestQuery.length - 1) !== '?') {
                        requestQuery += '&';
                    }

                    requestQuery += (requestParam + '=' + requestOptions.options[requestParam]);
                }
            }

            // Make the call, asynchronously, and fire the callback with the results.
            $.ajax({
                cache    : true,
                dataType : 'jsonp',
                url      : requestUrl + requestQuery,
                type     : 'GET',
                success  : function(data, textStatus, jqXHR) {
                    requestComplete = true;

                    requestOptions.options.callback(data);
                }
            });

            // jQuery doesn't call the `error` or `complete` callbacks for
            // **jsonp** requests when things go wrong.  This is our backup for
            // such situations.
            setTimeout(function() {
                if (!requestComplete) {
                    var result = {
                        status : {
                            code : 404,
                            msg           : 'Invalid request (' + requestUrl +
                                '): The request was either for a non-DirecTV ' +
                                'set-top-box, was for an invalid endpoint of ' +
                                'a DirecTV set-top-box or the parameter(s) ' +
                                'passed to the endpoint were invalid.',
                            commandResult : 1,
                            query : requestQuery
                        }
                    };

                    requestOptions.options.callback(result);
                }
            }, 5000);
        }
    });

}).call(this);
