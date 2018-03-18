/*******************************************************************************

    Nano Adblocker - Just another adblocker
    Copyright (C) 2017-2018 Nano Adblocker contributors

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see {http://www.gnu.org/licenses/}.

    Home: https://github.com/NanoAdblocker/NanoCore

*******************************************************************************/

'use strict';

ace.define('ace/mode/nano_filters', function(require, exports, module) {
    var oop = ace.require('ace/lib/oop');
    var TextMode = ace.require('ace/mode/text').Mode;
    var HighlightRules = ace.require('ace/mode/nano_filters_hr').HighlightRules;

    // The way tokenRe works seems to have changed, must test if Ace is updated
    // https://github.com/ajaxorg/ace/pull/3454/files#diff-2a8db065be808cdb78daf80b97fcb4aa
    var unicode = require('ace/unicode');
    exports.Mode = function() {
        this.HighlightRules = HighlightRules;
        this.lineCommentStart = '!';
        this.tokenRe = new RegExp(
            '^[' + unicode.packages.L + unicode.packages.Mn +
                unicode.packages.Mc + unicode.packages.Nd +
                unicode.packages.Pc + '\\-_.]+',
            'g'
        );
    };
    oop.inherits(exports.Mode, TextMode);
});

ace.define('ace/mode/nano_filters_hr', function(require, exports, module) {
    var oop = ace.require('ace/lib/oop');
    var TextHighlightRules = ace.require('ace/mode/text_highlight_rules')
        .TextHighlightRules;
    exports.HighlightRules = function() {
        this.$rules = {
            start: [
                // Header
                /*
                {
                    token: 'invisible',
                    regex: /^! === /,
                    next: 'header'
                },
                */
                // Preprocessor
                {
                    token: 'keyword',
                    regex: /^!#/,
                    next: 'preprocessor'
                },
                // Comments
                {
                    token: 'invisible',
                    regex: /^(?:!|#(?: |$)|\[).*/
                },
                {
                    token: 'invisible',
                    regex: / #.*/
                },
                // Cosmetic
                {
                    token: 'keyword',
                    regex: /#@?(?:\?|\$)?#\^?(?!$)/,
                    next: 'double_hash'
                },
                {
                    // Operator @ is at the wrong place
                    token: 'invalid',
                    regex: /#@?(?:\?|\$)?@#\^?(?!$)/,
                    next: 'double_hash'
                },
                {
                    // Raw JS injection is not yet supported
                    token: 'invalid',
                    regex: /#@?%@?#/
                },
                // Operators
                {
                    token: 'keyword',
                    regex: /^@@/
                },
                {
                    token: 'keyword.operator',
                    regex: /\||,|\^|\*/
                },
                // Options
                {
                    token: 'invalid',
                    regex: /\$(?!.*?(?:\/|\$)),/,
                    next: 'options'
                },
                {
                    // Unexpected end of line
                    token: 'invalid',
                    regex: /\$$/
                },
                {
                    token: 'keyword',
                    regex: /\$(?!.*?(?:\/|\$))/,
                    next: 'options'
                },
                // Domains (default)
                {
                    defaultToken: 'string'
                }
            ],
            /*
            header: [
                // Exit
                {
                    token: 'text',
                    regex: /$/,
                    next: 'start'
                },
                // Operators
                {
                    token: 'keyword.operator',
                    regex: /,/
                },
                // NSFW header
                {
                    token: 'keyword',
                    regex: /NSFW!/
                },
                // Header text (default)
                {
                    defaultToken: 'text'
                }
            ],
            */
            preprocessor: [
                // Exit
                {
                    token: 'text',
                    regex: /$/,
                    next: 'start'
                },
                // Includes
                {
                    token: 'keyword',
                    regex: /include (?!$)/,
                    next: 'include_url'
                },
                {
                    token: 'keyword',
                    regex: /nano-include-content-(?:start|end) (?!$)/,
                    next: 'include_url'
                },
                // Invalid (default)
                {
                    defaultToken: 'invalid'
                }
            ],
            include_url: [
                // Exit
                {
                    token: 'text',
                    regex: /$/,
                    next: 'start'
                },
                // Text (default)
                {
                    defaultToken: 'text'
                }
            ],
            double_hash: [
                // Exit
                {
                    token: 'text',
                    regex: /$/,
                    next: 'start'
                },
                // Script inject
                {
                    token: 'keyword',
                    regex: /script:inject\(/,
                    next: 'script_inject_part1'
                },
                // CSS (default)
                {
                    defaultToken: 'constant'
                }
            ],
            script_inject_part1: [
                // Exit
                {
                    // TODO 2017-12-07: Is this right? Need to investigate how
                    // uBlock Origin process commas
                    token: 'invalid',
                    regex: /,\)?$/,
                    next: 'start'
                },
                {
                    token: 'keyword',
                    regex: /\)$/,
                    next: 'start'
                },
                {
                    // Unexpected line break
                    token: 'invalid',
                    regex: /.?$/,
                    next: 'start'
                },
                // Parameters
                {
                    token: 'keyword.operator',
                    regex: /,/,
                    next: 'script_inject_part2'
                },
                // Scriplet name (default)
                {
                    defaultToken: 'variable'
                }
            ],
            script_inject_part2: [
                // Exit
                {
                    // Missing parentheses
                    token: 'invalid',
                    regex: /[^\)]?$/,
                    next: 'start'
                },
                {
                    token: 'keyword',
                    regex: /\)$/,
                    next: 'start'
                },
                // Separator
                {
                    token: 'keyword',
                    regex: /,/,
                    next: 'script_inject_part2'
                },
                // Parameters (default)
                {
                    defaultToken: 'constant'
                }
            ],
            options: [
                // Exit
                {
                    token: 'invalid',
                    regex: /,$/,
                    next: 'start'
                },
                {
                    token: 'text',
                    regex: /$/,
                    next: 'start'
                },
                // Operators
                {
                    token: 'keyword.operator',
                    regex: /,/
                },
                // Modifiers
                {
                    token: 'keyword',
                    regex: /document|~?(?:third-party|3p|first-party|1p)|important|badfilter/
                },
                // Actions
                {
                    token: 'variable',
                    // inline-font and inline-script must be before font and script
                    regex: /elemhide|generichide|inline-font|inline-script|popunder|popup|ghide/
                },
                // Types
                {
                    // Resource type
                    token: 'variable',
                    // object-subrequest must be before object
                    regex: /~?(?:font|image|media|object-subrequest|object|script|stylesheet|subdocument|xmlhttprequest|css|iframe|xhr|mp4)/
                },
                {
                    // Special types
                    token: 'variable',
                    regex: /beacon|data|other|ping|websocket/
                },
                // Redirect
                {
                    token: 'keyword',
                    regex: /redirect=/,
                    next: 'options_redirect'
                },
                // Domains restriction
                {
                    token: 'keyword',
                    regex: /domain=/,
                    next: 'options_domain'
                },
                // CSP
                {
                    token: 'keyword',
                    regex: /csp=/,
                    next: 'options_csp'
                },
                {
                    token: 'keyword',
                    regex: /csp/
                },
                // Invalid (default)
                {
                    defaultToken: 'invalid'
                }
            ],
            options_redirect: [
                // Exit
                {
                    token: 'invalid',
                    regex: /,$/,
                    next: 'start'
                },
                {
                    token: 'text',
                    regex: /$/,
                    next: 'start'
                },
                // Operators
                {
                    token: 'keyword.operator',
                    regex: /,/,
                    next: 'options'
                },
                // Redirect resource name (default)
                {
                    defaultToken: 'variable',
                }
            ],
            options_domain: [
                // Exit
                {
                    token: 'invalid',
                    regex: /,$/,
                    next: 'start'
                },
                {
                    token: 'text',
                    regex: /$/,
                    next: 'start'
                },
                // Operators
                {
                    token: 'keyword.operator',
                    regex: /,/,
                    next: 'options'
                },
                // Domains (default)
                {
                    defaultToken: 'string'
                }
            ],
            options_csp: [
                // Exit
                {
                    token: 'invalid',
                    regex: /,$/,
                    next: 'start'
                },
                {
                    token: 'text',
                    regex: /$/,
                    next: 'start'
                },
                // Operators
                {
                    token: 'keyword.operator',
                    regex: /,/,
                    next: 'options'
                },
                // CSP text (default)
                {
                    defaultToken: 'constant'
                }
            ]
        };
    };
    oop.inherits(exports.HighlightRules, TextHighlightRules);
});
