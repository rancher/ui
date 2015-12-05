/**

// bower_components/no-vnc/LICENSE.txt
noVNC is Copyright (C) 2011 Joel Martin <github@martintribe.org>

The noVNC core library files are licensed under the MPL 2.0 (Mozilla
Public License 2.0). The noVNC core library is composed of the
Javascript code necessary for full noVNC operation. This includes (but
is not limited to):

    include/base64.js
    include/des.js
    include/display.js
    include/input.js
    include/jsunzip.js
    include/keysym.js
    include/logo.js
    include/rfb.js
    include/ui.js
    include/util.js
    include/vnc.js
    include/websock.js
    include/webutil.js

The HTML, CSS, font and images files that included with the noVNC
source distibution (or repository) are not considered part of the
noVNC core library and are licensed under more permissive licenses.
The intent is to allow easy integration of noVNC into existing web
sites and web applications.

The HTML, CSS, font and image files are licensed as follows:

    *.html                     : 2-Clause BSD license

    include/*.css              : 2-Clause BSD license

    include/Orbitron*          : SIL Open Font License 1.1
                                 (Copyright 2009 Matt McInerney)

    images/                    : Creative Commons Attribution-ShareAlike
                                 http://creativecommons.org/licenses/by-sa/3.0/

Some portions of noVNC are copyright to their individual authors.
Please refer to the individual source files and/or to the noVNC commit
history: https://github.com/kanaka/noVNC/commits/master

The are several files and projects that have been incorporated into
the noVNC core library. Here is a list of those files and the original
licenses (all MPL 2.0 compatible):

    include/base64.js          : MPL 2.0
   
    include/des.js             : Various BSD style licenses

    include/jsunzip.js         : zlib/libpng license

    include/web-socket-js/     : New BSD license (3-clause). Source code at
                                 http://github.com/gimite/web-socket-js

    include/chrome-app/tcp-stream.js
                               : Apache 2.0 license

    utils/websockify
    utils/websocket.py         : LGPL 3

The following license texts are included:

    docs/LICENSE.MPL-2.0
    docs/LICENSE.LGPL-3 and
    docs/LICENSE.GPL-3
    docs/LICENSE.OFL-1.1
    docs/LICENSE.BSD-3-Clause (New BSD)
    docs/LICENSE.BSD-2-Clause (Simplified BSD / FreeBSD)
    docs/LICENSE.zlib
    docs/LICENSE.Apache-2.0

Or alternatively the license texts may be found here:

    http://www.mozilla.org/MPL/2.0/
    http://www.gnu.org/licenses/lgpl.html and
    http://www.gnu.org/licenses/gpl.html
    http://scripts.sil.org/OFL
    http://en.wikipedia.org/wiki/BSD_licenses
    http://www.gzip.org/zlib/zlib_license.html
    http://www.apache.org/licenses/LICENSE-2.0.html
//End of bower_components/no-vnc/LICENSE.txt
**/
var NoVNC = (function(window) {

var Websock_native;
var Base64 = { encode: function(d) { return btoa(d); }, decode: function(e) { return atob(e); } };


// bower_components/no-vnc/include/util.js
/*
 * noVNC: HTML5 VNC client
 * Copyright (C) 2012 Joel Martin
 * Licensed under MPL 2.0 (see LICENSE.txt)
 *
 * See README.md for usage and integration instructions.
 */

/* jshint white: false, nonstandard: true */
/*global window, console, document, navigator, ActiveXObject, INCLUDE_URI */

// Globals defined here
var Util = {};


/*
 * Make arrays quack
 */

var addFunc = function (cl, name, func) {
    if (!cl.prototype[name]) {
        Object.defineProperty(cl.prototype, name, { enumerable: false, value: func });
    }
};

addFunc(Array, 'push8', function (num) {
    "use strict";
    this.push(num & 0xFF);
});

addFunc(Array, 'push16', function (num) {
    "use strict";
    this.push((num >> 8) & 0xFF,
              num & 0xFF);
});

addFunc(Array, 'push32', function (num) {
    "use strict";
    this.push((num >> 24) & 0xFF,
              (num >> 16) & 0xFF,
              (num >>  8) & 0xFF,
              num & 0xFF);
});

// IE does not support map (even in IE9)
//This prototype is provided by the Mozilla foundation and
//is distributed under the MIT license.
//http://www.ibiblio.org/pub/Linux/LICENSES/mit.license
addFunc(Array, 'map', function (fun /*, thisp*/) {
    "use strict";
    var len = this.length;
    if (typeof fun != "function") {
        throw new TypeError();
    }

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++) {
        if (i in this) {
            res[i] = fun.call(thisp, this[i], i, this);
        }
    }

    return res;
});

// IE <9 does not support indexOf
//This prototype is provided by the Mozilla foundation and
//is distributed under the MIT license.
//http://www.ibiblio.org/pub/Linux/LICENSES/mit.license
addFunc(Array, 'indexOf', function (elt /*, from*/) {
    "use strict";
    var len = this.length >>> 0;

    var from = Number(arguments[1]) || 0;
    from = (from < 0) ? Math.ceil(from) : Math.floor(from);
    if (from < 0) {
        from += len;
    }

    for (; from < len; from++) {
        if (from in this &&
                this[from] === elt) {
            return from;
        }
    }
    return -1;
});

// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
if (!Object.keys) {
    Object.keys = (function () {
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function (obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for (prop in obj) {
                if (hasOwnProperty.call(obj, prop)) {
                    result.push(prop);
                }
            }

            if (hasDontEnumBug) {
                for (i = 0; i < dontEnumsLength; i++) {
                    if (hasOwnProperty.call(obj, dontEnums[i])) {
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    })();
}

// PhantomJS 1.x doesn't support bind,
// so leave this in until PhantomJS 2.0 is released
//This prototype is provided by the Mozilla foundation and
//is distributed under the MIT license.
//http://www.ibiblio.org/pub/Linux/LICENSES/mit.license
addFunc(Function, 'bind', function (oThis) {
    if (typeof this !== "function") {
        // closest thing possible to the ECMAScript 5
        // internal IsCallable function
        throw new TypeError("Function.prototype.bind - " +
                            "what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1),
            fToBind = this,
            fNOP = function () {},
            fBound = function () {
                return fToBind.apply(this instanceof fNOP && oThis ? this
                                                                   : oThis,
                                     aArgs.concat(Array.prototype.slice.call(arguments)));
            };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
});

//
// requestAnimationFrame shim with setTimeout fallback
//

window.requestAnimFrame = (function () {
    "use strict";
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

/*
 * ------------------------------------------------------
 * Namespaced in Util
 * ------------------------------------------------------
 */

/*
 * Logging/debug routines
 */

Util._log_level = 'warn';
Util.init_logging = function (level) {
    "use strict";
    if (typeof level === 'undefined') {
        level = Util._log_level;
    } else {
        Util._log_level = level;
    }
    if (typeof window.console === "undefined") {
        if (typeof window.opera !== "undefined") {
            window.console = {
                'log'  : window.opera.postError,
                'warn' : window.opera.postError,
                'error': window.opera.postError
            };
        } else {
            window.console = {
                'log'  : function (m) {},
                'warn' : function (m) {},
                'error': function (m) {}
            };
        }
    }

    Util.Debug = Util.Info = Util.Warn = Util.Error = function (msg) {};
    /* jshint -W086 */
    switch (level) {
        case 'debug':
            Util.Debug = function (msg) { console.log(msg); };
        case 'info':
            Util.Info  = function (msg) { console.log(msg); };
        case 'warn':
            Util.Warn  = function (msg) { console.warn(msg); };
        case 'error':
            Util.Error = function (msg) { console.error(msg); };
        case 'none':
            break;
        default:
            throw new Error("invalid logging type '" + level + "'");
    }
    /* jshint +W086 */
};
Util.get_logging = function () {
    return Util._log_level;
};
// Initialize logging level
Util.init_logging();

Util.make_property = function (proto, name, mode, type) {
    "use strict";

    var getter;
    if (type === 'arr') {
        getter = function (idx) {
            if (typeof idx !== 'undefined') {
                return this['_' + name][idx];
            } else {
                return this['_' + name];
            }
        };
    } else {
        getter = function () {
            return this['_' + name];
        };
    }

    var make_setter = function (process_val) {
        if (process_val) {
            return function (val, idx) {
                if (typeof idx !== 'undefined') {
                    this['_' + name][idx] = process_val(val);
                } else {
                    this['_' + name] = process_val(val);
                }
            };
        } else {
            return function (val, idx) {
                if (typeof idx !== 'undefined') {
                    this['_' + name][idx] = val;
                } else {
                    this['_' + name] = val;
                }
            };
        }
    };

    var setter;
    if (type === 'bool') {
        setter = make_setter(function (val) {
            if (!val || (val in {'0': 1, 'no': 1, 'false': 1})) {
                return false;
            } else {
                return true;
            }
        });
    } else if (type === 'int') {
        setter = make_setter(function (val) { return parseInt(val, 10); });
    } else if (type === 'float') {
        setter = make_setter(parseFloat);
    } else if (type === 'str') {
        setter = make_setter(String);
    } else if (type === 'func') {
        setter = make_setter(function (val) {
            if (!val) {
                return function () {};
            } else {
                return val;
            }
        });
    } else if (type === 'arr' || type === 'dom' || type == 'raw') {
        setter = make_setter();
    } else {
        throw new Error('Unknown property type ' + type);  // some sanity checking
    }

    // set the getter
    if (typeof proto['get_' + name] === 'undefined') {
        proto['get_' + name] = getter;
    }

    // set the setter if needed
    if (typeof proto['set_' + name] === 'undefined') {
        if (mode === 'rw') {
            proto['set_' + name] = setter;
        } else if (mode === 'wo') {
            proto['set_' + name] = function (val, idx) {
                if (typeof this['_' + name] !== 'undefined') {
                    throw new Error(name + " can only be set once");
                }
                setter.call(this, val, idx);
            };
        }
    }

    // make a special setter that we can use in set defaults
    proto['_raw_set_' + name] = function (val, idx) {
        setter.call(this, val, idx);
        //delete this['_init_set_' + name];  // remove it after use
    };
};

Util.make_properties = function (constructor, arr) {
    "use strict";
    for (var i = 0; i < arr.length; i++) {
        Util.make_property(constructor.prototype, arr[i][0], arr[i][1], arr[i][2]);
    }
};

Util.set_defaults = function (obj, conf, defaults) {
    var defaults_keys = Object.keys(defaults);
    var conf_keys = Object.keys(conf);
    var keys_obj = {};
    var i;
    for (i = 0; i < defaults_keys.length; i++) { keys_obj[defaults_keys[i]] = 1; }
    for (i = 0; i < conf_keys.length; i++) { keys_obj[conf_keys[i]] = 1; }
    var keys = Object.keys(keys_obj);

    for (i = 0; i < keys.length; i++) {
        var setter = obj['_raw_set_' + keys[i]];
        if (!setter) {
          Util.Warn('Invalid property ' + keys[i]);
          continue;
        }

        if (keys[i] in conf) {
            setter.call(obj, conf[keys[i]]);
        } else {
            setter.call(obj, defaults[keys[i]]);
        }
    }
};

/*
 * Decode from UTF-8
 */
Util.decodeUTF8 = function (utf8string) {
    "use strict";
    return decodeURIComponent(escape(utf8string));
};



/*
 * Cross-browser routines
 */


// Dynamically load scripts without using document.write()
// Reference: http://unixpapa.com/js/dyna.html
//
// Handles the case where load_scripts is invoked from a script that
// itself is loaded via load_scripts. Once all scripts are loaded the
// window.onscriptsloaded handler is called (if set).
Util.get_include_uri = function () {
    return (typeof INCLUDE_URI !== "undefined") ? INCLUDE_URI : "include/";
};
Util._loading_scripts = [];
Util._pending_scripts = [];
Util.load_scripts = function (files) {
    "use strict";
    var head = document.getElementsByTagName('head')[0], script,
        ls = Util._loading_scripts, ps = Util._pending_scripts;

    var loadFunc = function (e) {
        while (ls.length > 0 && (ls[0].readyState === 'loaded' ||
                                 ls[0].readyState === 'complete')) {
            // For IE, append the script to trigger execution
            var s = ls.shift();
            //console.log("loaded script: " + s.src);
            head.appendChild(s);
        }
        if (!this.readyState ||
            (Util.Engine.presto && this.readyState === 'loaded') ||
            this.readyState === 'complete') {
            if (ps.indexOf(this) >= 0) {
                this.onload = this.onreadystatechange = null;
                //console.log("completed script: " + this.src);
                ps.splice(ps.indexOf(this), 1);

                // Call window.onscriptsload after last script loads
                if (ps.length === 0 && window.onscriptsload) {
                    window.onscriptsload();
                }
            }
        }
    };

    for (var f = 0; f < files.length; f++) {
        script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = Util.get_include_uri() + files[f];
        //console.log("loading script: " + script.src);
        script.onload = script.onreadystatechange = loadFunc;
        // In-order script execution tricks
        if (Util.Engine.trident) {
            // For IE wait until readyState is 'loaded' before
            // appending it which will trigger execution
            // http://wiki.whatwg.org/wiki/Dynamic_Script_Execution_Order
            ls.push(script);
        } else {
            // For webkit and firefox set async=false and append now
            // https://developer.mozilla.org/en-US/docs/HTML/Element/script
            script.async = false;
            head.appendChild(script);
        }
        ps.push(script);
    }
};


// Get DOM element position on page
//  This solution is based based on http://www.greywyvern.com/?post=331
//  Thanks to Brian Huisman AKA GreyWyvern!
Util.getPosition = (function () {
    "use strict";
    function getStyle(obj, styleProp) {
        var y;
        if (obj.currentStyle) {
            y = obj.currentStyle[styleProp];
        } else if (window.getComputedStyle)
            y = window.getComputedStyle(obj, null)[styleProp];
        return y;
    }

    function scrollDist() {
        var myScrollTop = 0, myScrollLeft = 0;
        var html = document.getElementsByTagName('html')[0];

        // get the scrollTop part
        if (html.scrollTop && document.documentElement.scrollTop) {
            myScrollTop = html.scrollTop;
        } else if (html.scrollTop || document.documentElement.scrollTop) {
            myScrollTop = html.scrollTop + document.documentElement.scrollTop;
        } else if (document.body.scrollTop) {
            myScrollTop = document.body.scrollTop;
        } else {
            myScrollTop = 0;
        }

        // get the scrollLeft part
        if (html.scrollLeft && document.documentElement.scrollLeft) {
            myScrollLeft = html.scrollLeft;
        } else if (html.scrollLeft || document.documentElement.scrollLeft) {
            myScrollLeft = html.scrollLeft + document.documentElement.scrollLeft;
        } else if (document.body.scrollLeft) {
            myScrollLeft = document.body.scrollLeft;
        } else {
            myScrollLeft = 0;
        }

        return [myScrollLeft, myScrollTop];
    }

    return function (obj) {
        var curleft = 0, curtop = 0, scr = obj, fixed = false;
        while ((scr = scr.parentNode) && scr != document.body) {
            curleft -= scr.scrollLeft || 0;
            curtop -= scr.scrollTop || 0;
            if (getStyle(scr, "position") == "fixed") {
                fixed = true;
            }
        }
        if (fixed && !window.opera) {
            var scrDist = scrollDist();
            curleft += scrDist[0];
            curtop += scrDist[1];
        }

        do {
            curleft += obj.offsetLeft;
            curtop += obj.offsetTop;
        } while ((obj = obj.offsetParent));

        return {'x': curleft, 'y': curtop};
    };
})();


// Get mouse event position in DOM element
Util.getEventPosition = function (e, obj, scale) {
    "use strict";
    var evt, docX, docY, pos;
    //if (!e) evt = window.event;
    evt = (e ? e : window.event);
    evt = (evt.changedTouches ? evt.changedTouches[0] : evt.touches ? evt.touches[0] : evt);
    if (evt.pageX || evt.pageY) {
        docX = evt.pageX;
        docY = evt.pageY;
    } else if (evt.clientX || evt.clientY) {
        docX = evt.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
        docY = evt.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
    }
    pos = Util.getPosition(obj);
    if (typeof scale === "undefined") {
        scale = 1;
    }
    var realx = docX - pos.x;
    var realy = docY - pos.y;
    var x = Math.max(Math.min(realx, obj.width - 1), 0);
    var y = Math.max(Math.min(realy, obj.height - 1), 0);
    return {'x': x / scale, 'y': y / scale, 'realx': realx / scale, 'realy': realy / scale};
};


// Event registration. Based on: http://www.scottandrew.com/weblog/articles/cbs-events
Util.addEvent = function (obj, evType, fn) {
    "use strict";
    if (obj.attachEvent) {
        var r = obj.attachEvent("on" + evType, fn);
        return r;
    } else if (obj.addEventListener) {
        obj.addEventListener(evType, fn, false);
        return true;
    } else {
        throw new Error("Handler could not be attached");
    }
};

Util.removeEvent = function (obj, evType, fn) {
    "use strict";
    if (obj.detachEvent) {
        var r = obj.detachEvent("on" + evType, fn);
        return r;
    } else if (obj.removeEventListener) {
        obj.removeEventListener(evType, fn, false);
        return true;
    } else {
        throw new Error("Handler could not be removed");
    }
};

Util.stopEvent = function (e) {
    "use strict";
    if (e.stopPropagation) { e.stopPropagation(); }
    else                   { e.cancelBubble = true; }

    if (e.preventDefault)  { e.preventDefault(); }
    else                   { e.returnValue = false; }
};


// Set browser engine versions. Based on mootools.
Util.Features = {xpath: !!(document.evaluate), air: !!(window.runtime), query: !!(document.querySelector)};

(function () {
    "use strict";
    // 'presto': (function () { return (!window.opera) ? false : true; }()),
    var detectPresto = function () {
        return !!window.opera;
    };

    // 'trident': (function () { return (!window.ActiveXObject) ? false : ((window.XMLHttpRequest) ? ((document.querySelectorAll) ? 6 : 5) : 4);
    var detectTrident = function () {
        if (!window.ActiveXObject) {
            return false;
        } else {
            if (window.XMLHttpRequest) {
                return (document.querySelectorAll) ? 6 : 5;
            } else {
                return 4;
            }
        }
    };

    // 'webkit': (function () { try { return (navigator.taintEnabled) ? false : ((Util.Features.xpath) ? ((Util.Features.query) ? 525 : 420) : 419); } catch (e) { return false; } }()),
    var detectInitialWebkit = function () {
        try {
            if (navigator.taintEnabled) {
                return false;
            } else {
                if (Util.Features.xpath) {
                    return (Util.Features.query) ? 525 : 420;
                } else {
                    return 419;
                }
            }
        } catch (e) {
            return false;
        }
    };

    var detectActualWebkit = function (initial_ver) {
        var re = /WebKit\/([0-9\.]*) /;
        var str_ver = (navigator.userAgent.match(re) || ['', initial_ver])[1];
        return parseFloat(str_ver, 10);
    };

    // 'gecko': (function () { return (!document.getBoxObjectFor && window.mozInnerScreenX == null) ? false : ((document.getElementsByClassName) ? 19ssName) ? 19 : 18 : 18); }())
    var detectGecko = function () {
        /* jshint -W041 */
        if (!document.getBoxObjectFor && window.mozInnerScreenX == null) {
            return false;
        } else {
            return (document.getElementsByClassName) ? 19 : 18;
        }
        /* jshint +W041 */
    };

    Util.Engine = {
        // Version detection break in Opera 11.60 (errors on arguments.callee.caller reference)
        //'presto': (function() {
        //         return (!window.opera) ? false : ((arguments.callee.caller) ? 960 : ((document.getElementsByClassName) ? 950 : 925)); }()),
        'presto': detectPresto(),
        'trident': detectTrident(),
        'webkit': detectInitialWebkit(),
        'gecko': detectGecko(),
    };

    if (Util.Engine.webkit) {
        // Extract actual webkit version if available
        Util.Engine.webkit = detectActualWebkit(Util.Engine.webkit);
    }
})();

Util.Flash = (function () {
    "use strict";
    var v, version;
    try {
        v = navigator.plugins['Shockwave Flash'].description;
    } catch (err1) {
        try {
            v = new ActiveXObject('ShockwaveFlash.ShockwaveFlash').GetVariable('$version');
        } catch (err2) {
            v = '0 r0';
        }
    }
    version = v.match(/\d+/g);
    return {version: parseInt(version[0] || 0 + '.' + version[1], 10) || 0, build: parseInt(version[2], 10) || 0};
}());
//End of bower_components/no-vnc/include/util.js

// bower_components/no-vnc/include/webutil.js
/*
 * noVNC: HTML5 VNC client
 * Copyright (C) 2012 Joel Martin
 * Copyright (C) 2013 NTT corp.
 * Licensed under MPL 2.0 (see LICENSE.txt)
 *
 * See README.md for usage and integration instructions.
 */

/*jslint bitwise: false, white: false, browser: true, devel: true */
/*global Util, window, document */

// Globals defined here
var WebUtil = {}, $D;

/*
 * Simple DOM selector by ID
 */
if (!window.$D) {
    window.$D = function (id) {
        if (document.getElementById) {
            return document.getElementById(id);
        } else if (document.all) {
            return document.all[id];
        } else if (document.layers) {
            return document.layers[id];
        }
        return undefined;
    };
}


/*
 * ------------------------------------------------------
 * Namespaced in WebUtil
 * ------------------------------------------------------
 */

// init log level reading the logging HTTP param
WebUtil.init_logging = function (level) {
    "use strict";
    if (typeof level !== "undefined") {
        Util._log_level = level;
    } else {
        var param = document.location.href.match(/logging=([A-Za-z0-9\._\-]*)/);
        Util._log_level = (param || ['', Util._log_level])[1];
    }
    Util.init_logging();
};


WebUtil.dirObj = function (obj, depth, parent) {
    "use strict";
    if (! depth) { depth = 2; }
    if (! parent) { parent = ""; }

    // Print the properties of the passed-in object
    var msg = "";
    for (var i in obj) {
        if ((depth > 1) && (typeof obj[i] === "object")) {
            // Recurse attributes that are objects
            msg += WebUtil.dirObj(obj[i], depth - 1, parent + "." + i);
        } else {
            //val = new String(obj[i]).replace("\n", " ");
            var val = "";
            if (typeof(obj[i]) === "undefined") {
                val = "undefined";
            } else {
                val = obj[i].toString().replace("\n", " ");
            }
            if (val.length > 30) {
                val = val.substr(0, 30) + "...";
            }
            msg += parent + "." + i + ": " + val + "\n";
        }
    }
    return msg;
};

// Read a query string variable
WebUtil.getQueryVar = function (name, defVal) {
    "use strict";
    var re = new RegExp('.*[?&]' + name + '=([^&#]*)'),
        match = document.location.href.match(re);
    if (typeof defVal === 'undefined') { defVal = null; }
    if (match) {
        return decodeURIComponent(match[1]);
    } else {
        return defVal;
    }
};


/*
 * Cookie handling. Dervied from: http://www.quirksmode.org/js/cookies.html
 */

// No days means only for this browser session
WebUtil.createCookie = function (name, value, days) {
    "use strict";
    var date, expires;
    if (days) {
        date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toGMTString();
    } else {
        expires = "";
    }

    var secure;
    if (document.location.protocol === "https:") {
        secure = "; secure";
    } else {
        secure = "";
    }
    document.cookie = name + "=" + value + expires + "; path=/" + secure;
};

WebUtil.readCookie = function (name, defaultValue) {
    "use strict";
    var nameEQ = name + "=",
        ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i += 1) {
        var c = ca[i];
        while (c.charAt(0) === ' ') { c = c.substring(1, c.length); }
        if (c.indexOf(nameEQ) === 0) { return c.substring(nameEQ.length, c.length); }
    }
    return (typeof defaultValue !== 'undefined') ? defaultValue : null;
};

WebUtil.eraseCookie = function (name) {
    "use strict";
    WebUtil.createCookie(name, "", -1);
};

/*
 * Setting handling.
 */

WebUtil.initSettings = function (callback /*, ...callbackArgs */) {
    "use strict";
    var callbackArgs = Array.prototype.slice.call(arguments, 1);
    if (window.chrome && window.chrome.storage) {
        window.chrome.storage.sync.get(function (cfg) {
            WebUtil.settings = cfg;
            console.log(WebUtil.settings);
            if (callback) {
                callback.apply(this, callbackArgs);
            }
        });
    } else {
        // No-op
        if (callback) {
            callback.apply(this, callbackArgs);
        }
    }
};

// No days means only for this browser session
WebUtil.writeSetting = function (name, value) {
    "use strict";
    if (window.chrome && window.chrome.storage) {
        //console.log("writeSetting:", name, value);
        if (WebUtil.settings[name] !== value) {
            WebUtil.settings[name] = value;
            window.chrome.storage.sync.set(WebUtil.settings);
        }
    } else {
        localStorage.setItem(name, value);
    }
};

WebUtil.readSetting = function (name, defaultValue) {
    "use strict";
    var value;
    if (window.chrome && window.chrome.storage) {
        value = WebUtil.settings[name];
    } else {
        value = localStorage.getItem(name);
    }
    if (typeof value === "undefined") {
        value = null;
    }
    if (value === null && typeof defaultValue !== undefined) {
        return defaultValue;
    } else {
        return value;
    }
};

WebUtil.eraseSetting = function (name) {
    "use strict";
    if (window.chrome && window.chrome.storage) {
        window.chrome.storage.sync.remove(name);
        delete WebUtil.settings[name];
    } else {
        localStorage.removeItem(name);
    }
};

/*
 * Alternate stylesheet selection
 */
WebUtil.getStylesheets = function () {
    "use strict";
    var links = document.getElementsByTagName("link");
    var sheets = [];

    for (var i = 0; i < links.length; i += 1) {
        if (links[i].title &&
            links[i].rel.toUpperCase().indexOf("STYLESHEET") > -1) {
            sheets.push(links[i]);
        }
    }
    return sheets;
};

// No sheet means try and use value from cookie, null sheet used to
// clear all alternates.
WebUtil.selectStylesheet = function (sheet) {
    "use strict";
    if (typeof sheet === 'undefined') {
        sheet = 'default';
    }

    var sheets = WebUtil.getStylesheets();
    for (var i = 0; i < sheets.length; i += 1) {
        var link = sheets[i];
        if (link.title === sheet) {
            Util.Debug("Using stylesheet " + sheet);
            link.disabled = false;
        } else {
            //Util.Debug("Skipping stylesheet " + link.title);
            link.disabled = true;
        }
    }
    return sheet;
};
//End of bower_components/no-vnc/include/webutil.js

// bower_components/no-vnc/include/websock.js
/*
 * Websock: high-performance binary WebSockets
 * Copyright (C) 2012 Joel Martin
 * Licensed under MPL 2.0 (see LICENSE.txt)
 *
 * Websock is similar to the standard WebSocket object but Websock
 * enables communication with raw TCP sockets (i.e. the binary stream)
 * via websockify. This is accomplished by base64 encoding the data
 * stream between Websock and websockify.
 *
 * Websock has built-in receive queue buffering; the message event
 * does not contain actual data but is simply a notification that
 * there is new data available. Several rQ* methods are available to
 * read binary data off of the receive queue.
 */

/*jslint browser: true, bitwise: true */
/*global Util, Base64 */


// Load Flash WebSocket emulator if needed

// To force WebSocket emulator even when native WebSocket available
//window.WEB_SOCKET_FORCE_FLASH = true;
// To enable WebSocket emulator debug:
//window.WEB_SOCKET_DEBUG=1;

if (window.WebSocket && !window.WEB_SOCKET_FORCE_FLASH) {
    Websock_native = true;
} else if (window.MozWebSocket && !window.WEB_SOCKET_FORCE_FLASH) {
    Websock_native = true;
    window.WebSocket = window.MozWebSocket;
} else {
    /* no builtin WebSocket so load web_socket.js */

    Websock_native = false;
    (function () {
        window.WEB_SOCKET_SWF_LOCATION = Util.get_include_uri() +
                    "web-socket-js/WebSocketMain.swf";
        if (Util.Engine.trident) {
            Util.Debug("Forcing uncached load of WebSocketMain.swf");
            window.WEB_SOCKET_SWF_LOCATION += "?" + Math.random();
        }
        Util.load_scripts(["web-socket-js/swfobject.js",
                           "web-socket-js/web_socket.js"]);
    })();
}


function Websock() {
    "use strict";

    this._websocket = null;  // WebSocket object
    this._rQ = [];           // Receive queue
    this._rQi = 0;           // Receive queue index
    this._rQmax = 10000;     // Max receive queue size before compacting
    this._sQ = [];           // Send queue

    this._mode = 'base64';    // Current WebSocket mode: 'binary', 'base64'
    this.maxBufferedAmount = 200;

    this._eventHandlers = {
        'message': function () {},
        'open': function () {},
        'close': function () {},
        'error': function () {}
    };
}

(function () {
    "use strict";
    Websock.prototype = {
        // Getters and Setters
        get_sQ: function () {
            return this._sQ;
        },

        get_rQ: function () {
            return this._rQ;
        },

        get_rQi: function () {
            return this._rQi;
        },

        set_rQi: function (val) {
            this._rQi = val;
        },

        // Receive Queue
        rQlen: function () {
            return this._rQ.length - this._rQi;
        },

        rQpeek8: function () {
            return this._rQ[this._rQi];
        },

        rQshift8: function () {
            return this._rQ[this._rQi++];
        },

        rQskip8: function () {
            this._rQi++;
        },

        rQskipBytes: function (num) {
            this._rQi += num;
        },

        rQunshift8: function (num) {
            if (this._rQi === 0) {
                this._rQ.unshift(num);
            } else {
                this._rQi--;
                this._rQ[this._rQi] = num;
            }
        },

        rQshift16: function () {
            return (this._rQ[this._rQi++] << 8) +
                   this._rQ[this._rQi++];
        },

        rQshift32: function () {
            return (this._rQ[this._rQi++] << 24) +
                   (this._rQ[this._rQi++] << 16) +
                   (this._rQ[this._rQi++] << 8) +
                   this._rQ[this._rQi++];
        },

        rQshiftStr: function (len) {
            if (typeof(len) === 'undefined') { len = this.rQlen(); }
            var arr = this._rQ.slice(this._rQi, this._rQi + len);
            this._rQi += len;
            return String.fromCharCode.apply(null, arr);
        },

        rQshiftBytes: function (len) {
            if (typeof(len) === 'undefined') { len = this.rQlen(); }
            this._rQi += len;
            return this._rQ.slice(this._rQi - len, this._rQi);
        },

        rQslice: function (start, end) {
            if (end) {
                return this._rQ.slice(this._rQi + start, this._rQi + end);
            } else {
                return this._rQ.slice(this._rQi + start);
            }
        },

        // Check to see if we must wait for 'num' bytes (default to FBU.bytes)
        // to be available in the receive queue. Return true if we need to
        // wait (and possibly print a debug message), otherwise false.
        rQwait: function (msg, num, goback) {
            var rQlen = this._rQ.length - this._rQi; // Skip rQlen() function call
            if (rQlen < num) {
                if (goback) {
                    if (this._rQi < goback) {
                        throw new Error("rQwait cannot backup " + goback + " bytes");
                    }
                    this._rQi -= goback;
                }
                return true; // true means need more data
            }
            return false;
        },

        // Send Queue

        flush: function () {
            if (this._websocket.bufferedAmount !== 0) {
                Util.Debug("bufferedAmount: " + this._websocket.bufferedAmount);
            }

            if (this._websocket.bufferedAmount < this.maxBufferedAmount) {
                if (this._sQ.length > 0) {
                    this._websocket.send(this._encode_message());
                    this._sQ = [];
                }

                return true;
            } else {
                Util.Info("Delaying send, bufferedAmount: " +
                        this._websocket.bufferedAmount);
                return false;
            }
        },

        send: function (arr) {
           this._sQ = this._sQ.concat(arr);
           return this.flush();
        },

        send_string: function (str) {
            this.send(str.split('').map(function (chr) {
                return chr.charCodeAt(0);
            }));
        },

        // Event Handlers
        on: function (evt, handler) {
            this._eventHandlers[evt] = handler;
        },

        init: function (protocols, ws_schema) {
            this._rQ = [];
            this._rQi = 0;
            this._sQ = [];
            this._websocket = null;

            // Check for full typed array support
            var bt = false;
            if (('Uint8Array' in window) &&
                    ('set' in Uint8Array.prototype)) {
                bt = true;
            }

            // Check for full binary type support in WebSockets
            // Inspired by:
            // https://github.com/Modernizr/Modernizr/issues/370
            // https://github.com/Modernizr/Modernizr/blob/master/feature-detects/websockets/binary.js
            var wsbt = false;
            try {
                if (bt && ('binaryType' in WebSocket.prototype ||
                           !!(new WebSocket(ws_schema + '://.').binaryType))) {
                    Util.Info("Detected binaryType support in WebSockets");
                    wsbt = true;
                }
            } catch (exc) {
                // Just ignore failed test localhost connection
            }

            // Default protocols if not specified
            if (typeof(protocols) === "undefined") {
                if (wsbt) {
                    protocols = ['binary', 'base64'];
                } else {
                    protocols = 'base64';
                }
            }

            if (!wsbt) {
                if (protocols === 'binary') {
                    throw new Error('WebSocket binary sub-protocol requested but not supported');
                }

                if (typeof(protocols) === 'object') {
                    var new_protocols = [];

                    for (var i = 0; i < protocols.length; i++) {
                        if (protocols[i] === 'binary') {
                            Util.Error('Skipping unsupported WebSocket binary sub-protocol');
                        } else {
                            new_protocols.push(protocols[i]);
                        }
                    }

                    if (new_protocols.length > 0) {
                        protocols = new_protocols;
                    } else {
                        throw new Error("Only WebSocket binary sub-protocol was requested and is not supported.");
                    }
                }
            }

            return protocols;
        },

        open: function (uri, protocols) {
            var ws_schema = uri.match(/^([a-z]+):\/\//)[1];
            protocols = this.init(protocols, ws_schema);

            this._websocket = new WebSocket(uri, protocols);

            if (protocols.indexOf('binary') >= 0) {
                this._websocket.binaryType = 'arraybuffer';
            }

            this._websocket.onmessage = this._recv_message.bind(this);
            this._websocket.onopen = (function () {
                Util.Debug('>> WebSock.onopen');
                if (this._websocket.protocol) {
                    this._mode = this._websocket.protocol;
                    Util.Info("Server choose sub-protocol: " + this._websocket.protocol);
                } else {
                    this._mode = 'base64';
                    Util.Error('Server select no sub-protocol!: ' + this._websocket.protocol);
                }
                this._eventHandlers.open();
                Util.Debug("<< WebSock.onopen");
            }).bind(this);
            this._websocket.onclose = (function (e) {
                Util.Debug(">> WebSock.onclose");
                this._eventHandlers.close(e);
                Util.Debug("<< WebSock.onclose");
            }).bind(this);
            this._websocket.onerror = (function (e) {
                Util.Debug(">> WebSock.onerror: " + e);
                this._eventHandlers.error(e);
                Util.Debug("<< WebSock.onerror: " + e);
            }).bind(this);
        },

        close: function () {
            if (this._websocket) {
                if ((this._websocket.readyState === WebSocket.OPEN) ||
                        (this._websocket.readyState === WebSocket.CONNECTING)) {
                    Util.Info("Closing WebSocket connection");
                    this._websocket.close();
                }

                this._websocket.onmessage = function (e) { return; };
            }
        },

        // private methods
        _encode_message: function () {
            if (this._mode === 'binary') {
                // Put in a binary arraybuffer
                return (new Uint8Array(this._sQ)).buffer;
            } else {
                // base64 encode
                return Base64.encode(this._sQ);
            }
        },

        _decode_message: function (data) {
            if (this._mode === 'binary') {
                // push arraybuffer values onto the end
                var u8 = new Uint8Array(data);
                for (var i = 0; i < u8.length; i++) {
                    this._rQ.push(u8[i]);
                }
            } else {
                // base64 decode and concat to end
                this._rQ = this._rQ.concat(Base64.decode(data, 0));
            }
        },

        _recv_message: function (e) {
            try {
                this._decode_message(e.data);
                if (this.rQlen() > 0) {
                    this._eventHandlers.message();
                    // Compact the receive queue
                    if (this._rQ.length > this._rQmax) {
                        this._rQ = this._rQ.slice(this._rQi);
                        this._rQi = 0;
                    }
                } else {
                    Util.Debug("Ignoring empty message");
                }
            } catch (exc) {
                var exception_str = "";
                if (exc.name) {
                    exception_str += "\n    name: " + exc.name + "\n";
                    exception_str += "    message: " + exc.message + "\n";
                }

                if (typeof exc.description !== 'undefined') {
                    exception_str += "    description: " + exc.description + "\n";
                }

                if (typeof exc.stack !== 'undefined') {
                    exception_str += exc.stack;
                }

                if (exception_str.length > 0) {
                    Util.Error("recv_message, caught exception: " + exception_str);
                } else {
                    Util.Error("recv_message, caught exception: " + exc);
                }

                if (typeof exc.name !== 'undefined') {
                    this._eventHandlers.error(exc.name + ": " + exc.message);
                } else {
                    this._eventHandlers.error(exc);
                }
            }
        }
    };
})();
//End of bower_components/no-vnc/include/websock.js

// bower_components/no-vnc/include/des.js
/*
 * Ported from Flashlight VNC ActionScript implementation:
 *     http://www.wizhelp.com/flashlight-vnc/
 *
 * Full attribution follows:
 *
 * -------------------------------------------------------------------------
 *
 * This DES class has been extracted from package Acme.Crypto for use in VNC.
 * The unnecessary odd parity code has been removed.
 *
 * These changes are:
 *  Copyright (C) 1999 AT&T Laboratories Cambridge.  All Rights Reserved.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *

 * DesCipher - the DES encryption method
 *
 * The meat of this code is by Dave Zimmerman <dzimm@widget.com>, and is:
 *
 * Copyright (c) 1996 Widget Workshop, Inc. All Rights Reserved.
 *
 * Permission to use, copy, modify, and distribute this software
 * and its documentation for NON-COMMERCIAL or COMMERCIAL purposes and
 * without fee is hereby granted, provided that this copyright notice is kept 
 * intact. 
 * 
 * WIDGET WORKSHOP MAKES NO REPRESENTATIONS OR WARRANTIES ABOUT THE SUITABILITY
 * OF THE SOFTWARE, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WIDGET WORKSHOP SHALL NOT BE LIABLE
 * FOR ANY DAMAGES SUFFERED BY LICENSEE AS A RESULT OF USING, MODIFYING OR
 * DISTRIBUTING THIS SOFTWARE OR ITS DERIVATIVES.
 * 
 * THIS SOFTWARE IS NOT DESIGNED OR INTENDED FOR USE OR RESALE AS ON-LINE
 * CONTROL EQUIPMENT IN HAZARDOUS ENVIRONMENTS REQUIRING FAIL-SAFE
 * PERFORMANCE, SUCH AS IN THE OPERATION OF NUCLEAR FACILITIES, AIRCRAFT
 * NAVIGATION OR COMMUNICATION SYSTEMS, AIR TRAFFIC CONTROL, DIRECT LIFE
 * SUPPORT MACHINES, OR WEAPONS SYSTEMS, IN WHICH THE FAILURE OF THE
 * SOFTWARE COULD LEAD DIRECTLY TO DEATH, PERSONAL INJURY, OR SEVERE
 * PHYSICAL OR ENVIRONMENTAL DAMAGE ("HIGH RISK ACTIVITIES").  WIDGET WORKSHOP
 * SPECIFICALLY DISCLAIMS ANY EXPRESS OR IMPLIED WARRANTY OF FITNESS FOR
 * HIGH RISK ACTIVITIES.
 *
 *
 * The rest is:
 *
 * Copyright (C) 1996 by Jef Poskanzer <jef@acme.com>.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR AND CONTRIBUTORS ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS
 * OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 * LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 * OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 *
 * Visit the ACME Labs Java page for up-to-date versions of this and other
 * fine Java utilities: http://www.acme.com/java/
 */

/* jslint white: false */

function DES(passwd) {
    "use strict";

    // Tables, permutations, S-boxes, etc.
    // jshint -W013
    var PC2 = [13,16,10,23, 0, 4, 2,27,14, 5,20, 9,22,18,11, 3,
               25, 7,15, 6,26,19,12, 1,40,51,30,36,46,54,29,39,
               50,44,32,47,43,48,38,55,33,52,45,41,49,35,28,31 ],
        totrot = [ 1, 2, 4, 6, 8,10,12,14,15,17,19,21,23,25,27,28],
        z = 0x0, a,b,c,d,e,f, SP1,SP2,SP3,SP4,SP5,SP6,SP7,SP8,
        keys = [];

    // jshint -W015
    a=1<<16; b=1<<24; c=a|b; d=1<<2; e=1<<10; f=d|e;
    SP1 = [c|e,z|z,a|z,c|f,c|d,a|f,z|d,a|z,z|e,c|e,c|f,z|e,b|f,c|d,b|z,z|d,
           z|f,b|e,b|e,a|e,a|e,c|z,c|z,b|f,a|d,b|d,b|d,a|d,z|z,z|f,a|f,b|z,
           a|z,c|f,z|d,c|z,c|e,b|z,b|z,z|e,c|d,a|z,a|e,b|d,z|e,z|d,b|f,a|f,
           c|f,a|d,c|z,b|f,b|d,z|f,a|f,c|e,z|f,b|e,b|e,z|z,a|d,a|e,z|z,c|d];
    a=1<<20; b=1<<31; c=a|b; d=1<<5; e=1<<15; f=d|e;
    SP2 = [c|f,b|e,z|e,a|f,a|z,z|d,c|d,b|f,b|d,c|f,c|e,b|z,b|e,a|z,z|d,c|d,
           a|e,a|d,b|f,z|z,b|z,z|e,a|f,c|z,a|d,b|d,z|z,a|e,z|f,c|e,c|z,z|f,
           z|z,a|f,c|d,a|z,b|f,c|z,c|e,z|e,c|z,b|e,z|d,c|f,a|f,z|d,z|e,b|z,
           z|f,c|e,a|z,b|d,a|d,b|f,b|d,a|d,a|e,z|z,b|e,z|f,b|z,c|d,c|f,a|e];
    a=1<<17; b=1<<27; c=a|b; d=1<<3; e=1<<9; f=d|e;
    SP3 = [z|f,c|e,z|z,c|d,b|e,z|z,a|f,b|e,a|d,b|d,b|d,a|z,c|f,a|d,c|z,z|f,
           b|z,z|d,c|e,z|e,a|e,c|z,c|d,a|f,b|f,a|e,a|z,b|f,z|d,c|f,z|e,b|z,
           c|e,b|z,a|d,z|f,a|z,c|e,b|e,z|z,z|e,a|d,c|f,b|e,b|d,z|e,z|z,c|d,
           b|f,a|z,b|z,c|f,z|d,a|f,a|e,b|d,c|z,b|f,z|f,c|z,a|f,z|d,c|d,a|e];
    a=1<<13; b=1<<23; c=a|b; d=1<<0; e=1<<7; f=d|e;
    SP4 = [c|d,a|f,a|f,z|e,c|e,b|f,b|d,a|d,z|z,c|z,c|z,c|f,z|f,z|z,b|e,b|d,
           z|d,a|z,b|z,c|d,z|e,b|z,a|d,a|e,b|f,z|d,a|e,b|e,a|z,c|e,c|f,z|f,
           b|e,b|d,c|z,c|f,z|f,z|z,z|z,c|z,a|e,b|e,b|f,z|d,c|d,a|f,a|f,z|e,
           c|f,z|f,z|d,a|z,b|d,a|d,c|e,b|f,a|d,a|e,b|z,c|d,z|e,b|z,a|z,c|e];
    a=1<<25; b=1<<30; c=a|b; d=1<<8; e=1<<19; f=d|e;
    SP5 = [z|d,a|f,a|e,c|d,z|e,z|d,b|z,a|e,b|f,z|e,a|d,b|f,c|d,c|e,z|f,b|z,
           a|z,b|e,b|e,z|z,b|d,c|f,c|f,a|d,c|e,b|d,z|z,c|z,a|f,a|z,c|z,z|f,
           z|e,c|d,z|d,a|z,b|z,a|e,c|d,b|f,a|d,b|z,c|e,a|f,b|f,z|d,a|z,c|e,
           c|f,z|f,c|z,c|f,a|e,z|z,b|e,c|z,z|f,a|d,b|d,z|e,z|z,b|e,a|f,b|d];
    a=1<<22; b=1<<29; c=a|b; d=1<<4; e=1<<14; f=d|e;
    SP6 = [b|d,c|z,z|e,c|f,c|z,z|d,c|f,a|z,b|e,a|f,a|z,b|d,a|d,b|e,b|z,z|f,
           z|z,a|d,b|f,z|e,a|e,b|f,z|d,c|d,c|d,z|z,a|f,c|e,z|f,a|e,c|e,b|z,
           b|e,z|d,c|d,a|e,c|f,a|z,z|f,b|d,a|z,b|e,b|z,z|f,b|d,c|f,a|e,c|z,
           a|f,c|e,z|z,c|d,z|d,z|e,c|z,a|f,z|e,a|d,b|f,z|z,c|e,b|z,a|d,b|f];
    a=1<<21; b=1<<26; c=a|b; d=1<<1; e=1<<11; f=d|e;
    SP7 = [a|z,c|d,b|f,z|z,z|e,b|f,a|f,c|e,c|f,a|z,z|z,b|d,z|d,b|z,c|d,z|f,
           b|e,a|f,a|d,b|e,b|d,c|z,c|e,a|d,c|z,z|e,z|f,c|f,a|e,z|d,b|z,a|e,
           b|z,a|e,a|z,b|f,b|f,c|d,c|d,z|d,a|d,b|z,b|e,a|z,c|e,z|f,a|f,c|e,
           z|f,b|d,c|f,c|z,a|e,z|z,z|d,c|f,z|z,a|f,c|z,z|e,b|d,b|e,z|e,a|d];
    a=1<<18; b=1<<28; c=a|b; d=1<<6; e=1<<12; f=d|e;
    SP8 = [b|f,z|e,a|z,c|f,b|z,b|f,z|d,b|z,a|d,c|z,c|f,a|e,c|e,a|f,z|e,z|d,
           c|z,b|d,b|e,z|f,a|e,a|d,c|d,c|e,z|f,z|z,z|z,c|d,b|d,b|e,a|f,a|z,
           a|f,a|z,c|e,z|e,z|d,c|d,z|e,a|f,b|e,z|d,b|d,c|z,c|d,b|z,a|z,b|f,
           z|z,c|f,a|d,b|d,c|z,b|e,b|f,z|z,c|f,a|e,a|e,z|f,z|f,a|d,b|z,c|e];
    // jshint +W013,+W015

    // Set the key.
    function setKeys(keyBlock) {
        var i, j, l, m, n, o, pc1m = [], pcr = [], kn = [],
            raw0, raw1, rawi, KnLi;

        for (j = 0, l = 56; j < 56; ++j, l -= 8) {
            l += l < -5 ? 65 : l < -3 ? 31 : l < -1 ? 63 : l === 27 ? 35 : 0; // PC1
            m = l & 0x7;
            pc1m[j] = ((keyBlock[l >>> 3] & (1<<m)) !== 0) ? 1: 0;
        }

        for (i = 0; i < 16; ++i) {
            m = i << 1;
            n = m + 1;
            kn[m] = kn[n] = 0;
            for (o = 28; o < 59; o += 28) {
                for (j = o - 28; j < o; ++j) {
                    l = j + totrot[i];
                    if (l < o) {
                        pcr[j] = pc1m[l];
                    } else {
                        pcr[j] = pc1m[l - 28];
                    }
                }
            }
            for (j = 0; j < 24; ++j) {
                if (pcr[PC2[j]] !== 0) {
                    kn[m] |= 1 << (23 - j);
                }
                if (pcr[PC2[j + 24]] !== 0) {
                    kn[n] |= 1 << (23 - j);
                }
            }
        }

        // cookey
        for (i = 0, rawi = 0, KnLi = 0; i < 16; ++i) {
            raw0 = kn[rawi++];
            raw1 = kn[rawi++];
            keys[KnLi] = (raw0 & 0x00fc0000) << 6;
            keys[KnLi] |= (raw0 & 0x00000fc0) << 10;
            keys[KnLi] |= (raw1 & 0x00fc0000) >>> 10;
            keys[KnLi] |= (raw1 & 0x00000fc0) >>> 6;
            ++KnLi;
            keys[KnLi] = (raw0 & 0x0003f000) << 12;
            keys[KnLi] |= (raw0 & 0x0000003f) << 16;
            keys[KnLi] |= (raw1 & 0x0003f000) >>> 4;
            keys[KnLi] |= (raw1 & 0x0000003f);
            ++KnLi;
        }
    }

    // Encrypt 8 bytes of text
    function enc8(text) {
        var i = 0, b = text.slice(), fval, keysi = 0,
            l, r, x; // left, right, accumulator

        // Squash 8 bytes to 2 ints
        l = b[i++]<<24 | b[i++]<<16 | b[i++]<<8 | b[i++];
        r = b[i++]<<24 | b[i++]<<16 | b[i++]<<8 | b[i++];

        x = ((l >>> 4) ^ r) & 0x0f0f0f0f;
        r ^= x;
        l ^= (x << 4);
        x = ((l >>> 16) ^ r) & 0x0000ffff;
        r ^= x;
        l ^= (x << 16);
        x = ((r >>> 2) ^ l) & 0x33333333;
        l ^= x;
        r ^= (x << 2);
        x = ((r >>> 8) ^ l) & 0x00ff00ff;
        l ^= x;
        r ^= (x << 8);
        r = (r << 1) | ((r >>> 31) & 1);
        x = (l ^ r) & 0xaaaaaaaa;
        l ^= x;
        r ^= x;
        l = (l << 1) | ((l >>> 31) & 1);

        for (i = 0; i < 8; ++i) {
            x = (r << 28) | (r >>> 4);
            x ^= keys[keysi++];
            fval =  SP7[x & 0x3f];
            fval |= SP5[(x >>> 8) & 0x3f];
            fval |= SP3[(x >>> 16) & 0x3f];
            fval |= SP1[(x >>> 24) & 0x3f];
            x = r ^ keys[keysi++];
            fval |= SP8[x & 0x3f];
            fval |= SP6[(x >>> 8) & 0x3f];
            fval |= SP4[(x >>> 16) & 0x3f];
            fval |= SP2[(x >>> 24) & 0x3f];
            l ^= fval;
            x = (l << 28) | (l >>> 4);
            x ^= keys[keysi++];
            fval =  SP7[x & 0x3f];
            fval |= SP5[(x >>> 8) & 0x3f];
            fval |= SP3[(x >>> 16) & 0x3f];
            fval |= SP1[(x >>> 24) & 0x3f];
            x = l ^ keys[keysi++];
            fval |= SP8[x & 0x0000003f];
            fval |= SP6[(x >>> 8) & 0x3f];
            fval |= SP4[(x >>> 16) & 0x3f];
            fval |= SP2[(x >>> 24) & 0x3f];
            r ^= fval;
        }

        r = (r << 31) | (r >>> 1);
        x = (l ^ r) & 0xaaaaaaaa;
        l ^= x;
        r ^= x;
        l = (l << 31) | (l >>> 1);
        x = ((l >>> 8) ^ r) & 0x00ff00ff;
        r ^= x;
        l ^= (x << 8);
        x = ((l >>> 2) ^ r) & 0x33333333;
        r ^= x;
        l ^= (x << 2);
        x = ((r >>> 16) ^ l) & 0x0000ffff;
        l ^= x;
        r ^= (x << 16);
        x = ((r >>> 4) ^ l) & 0x0f0f0f0f;
        l ^= x;
        r ^= (x << 4);

        // Spread ints to bytes
        x = [r, l];
        for (i = 0; i < 8; i++) {
            b[i] = (x[i>>>2] >>> (8 * (3 - (i % 4)))) % 256;
            if (b[i] < 0) { b[i] += 256; } // unsigned
        }
        return b;
    }

    // Encrypt 16 bytes of text using passwd as key
    function encrypt(t) {
        return enc8(t.slice(0, 8)).concat(enc8(t.slice(8, 16)));
    }

    setKeys(passwd);             // Setup keys
    return {'encrypt': encrypt}; // Public interface

} // function DES
//End of bower_components/no-vnc/include/des.js

// bower_components/no-vnc/include/keysymdef.js
// This file describes mappings from Unicode codepoints to the keysym values
// (and optionally, key names) expected by the RFB protocol
// How this file was generated:
// node /Users/jalf/dev/mi/novnc/utils/parse.js /opt/X11/include/X11/keysymdef.h
var keysyms = (function(){
    "use strict";
    var keynames = null;
    var codepoints = {"32":32,"33":33,"34":34,"35":35,"36":36,"37":37,"38":38,"39":39,"40":40,"41":41,"42":42,"43":43,"44":44,"45":45,"46":46,"47":47,"48":48,"49":49,"50":50,"51":51,"52":52,"53":53,"54":54,"55":55,"56":56,"57":57,"58":58,"59":59,"60":60,"61":61,"62":62,"63":63,"64":64,"65":65,"66":66,"67":67,"68":68,"69":69,"70":70,"71":71,"72":72,"73":73,"74":74,"75":75,"76":76,"77":77,"78":78,"79":79,"80":80,"81":81,"82":82,"83":83,"84":84,"85":85,"86":86,"87":87,"88":88,"89":89,"90":90,"91":91,"92":92,"93":93,"94":94,"95":95,"96":96,"97":97,"98":98,"99":99,"100":100,"101":101,"102":102,"103":103,"104":104,"105":105,"106":106,"107":107,"108":108,"109":109,"110":110,"111":111,"112":112,"113":113,"114":114,"115":115,"116":116,"117":117,"118":118,"119":119,"120":120,"121":121,"122":122,"123":123,"124":124,"125":125,"126":126,"160":160,"161":161,"162":162,"163":163,"164":164,"165":165,"166":166,"167":167,"168":168,"169":169,"170":170,"171":171,"172":172,"173":173,"174":174,"175":175,"176":176,"177":177,"178":178,"179":179,"180":180,"181":181,"182":182,"183":183,"184":184,"185":185,"186":186,"187":187,"188":188,"189":189,"190":190,"191":191,"192":192,"193":193,"194":194,"195":195,"196":196,"197":197,"198":198,"199":199,"200":200,"201":201,"202":202,"203":203,"204":204,"205":205,"206":206,"207":207,"208":208,"209":209,"210":210,"211":211,"212":212,"213":213,"214":214,"215":215,"216":216,"217":217,"218":218,"219":219,"220":220,"221":221,"222":222,"223":223,"224":224,"225":225,"226":226,"227":227,"228":228,"229":229,"230":230,"231":231,"232":232,"233":233,"234":234,"235":235,"236":236,"237":237,"238":238,"239":239,"240":240,"241":241,"242":242,"243":243,"244":244,"245":245,"246":246,"247":247,"248":248,"249":249,"250":250,"251":251,"252":252,"253":253,"254":254,"255":255,"256":960,"257":992,"258":451,"259":483,"260":417,"261":433,"262":454,"263":486,"264":710,"265":742,"266":709,"267":741,"268":456,"269":488,"270":463,"271":495,"272":464,"273":496,"274":938,"275":954,"278":972,"279":1004,"280":458,"281":490,"282":460,"283":492,"284":728,"285":760,"286":683,"287":699,"288":725,"289":757,"290":939,"291":955,"292":678,"293":694,"294":673,"295":689,"296":933,"297":949,"298":975,"299":1007,"300":16777516,"301":16777517,"302":967,"303":999,"304":681,"305":697,"308":684,"309":700,"310":979,"311":1011,"312":930,"313":453,"314":485,"315":934,"316":950,"317":421,"318":437,"321":419,"322":435,"323":465,"324":497,"325":977,"326":1009,"327":466,"328":498,"330":957,"331":959,"332":978,"333":1010,"336":469,"337":501,"338":5052,"339":5053,"340":448,"341":480,"342":931,"343":947,"344":472,"345":504,"346":422,"347":438,"348":734,"349":766,"350":426,"351":442,"352":425,"353":441,"354":478,"355":510,"356":427,"357":443,"358":940,"359":956,"360":989,"361":1021,"362":990,"363":1022,"364":733,"365":765,"366":473,"367":505,"368":475,"369":507,"370":985,"371":1017,"372":16777588,"373":16777589,"374":16777590,"375":16777591,"376":5054,"377":428,"378":444,"379":431,"380":447,"381":430,"382":446,"399":16777615,"402":2294,"415":16777631,"416":16777632,"417":16777633,"431":16777647,"432":16777648,"437":16777653,"438":16777654,"439":16777655,"466":16777681,"486":16777702,"487":16777703,"601":16777817,"629":16777845,"658":16777874,"711":439,"728":418,"729":511,"731":434,"733":445,"901":1966,"902":1953,"904":1954,"905":1955,"906":1956,"908":1959,"910":1960,"911":1963,"912":1974,"913":1985,"914":1986,"915":1987,"916":1988,"917":1989,"918":1990,"919":1991,"920":1992,"921":1993,"922":1994,"923":1995,"924":1996,"925":1997,"926":1998,"927":1999,"928":2000,"929":2001,"931":2002,"932":2004,"933":2005,"934":2006,"935":2007,"936":2008,"937":2009,"938":1957,"939":1961,"940":1969,"941":1970,"942":1971,"943":1972,"944":1978,"945":2017,"946":2018,"947":2019,"948":2020,"949":2021,"950":2022,"951":2023,"952":2024,"953":2025,"954":2026,"955":2027,"956":2028,"957":2029,"958":2030,"959":2031,"960":2032,"961":2033,"962":2035,"963":2034,"964":2036,"965":2037,"966":2038,"967":2039,"968":2040,"969":2041,"970":1973,"971":1977,"972":1975,"973":1976,"974":1979,"1025":1715,"1026":1713,"1027":1714,"1028":1716,"1029":1717,"1030":1718,"1031":1719,"1032":1720,"1033":1721,"1034":1722,"1035":1723,"1036":1724,"1038":1726,"1039":1727,"1040":1761,"1041":1762,"1042":1783,"1043":1767,"1044":1764,"1045":1765,"1046":1782,"1047":1786,"1048":1769,"1049":1770,"1050":1771,"1051":1772,"1052":1773,"1053":1774,"1054":1775,"1055":1776,"1056":1778,"1057":1779,"1058":1780,"1059":1781,"1060":1766,"1061":1768,"1062":1763,"1063":1790,"1064":1787,"1065":1789,"1066":1791,"1067":1785,"1068":1784,"1069":1788,"1070":1760,"1071":1777,"1072":1729,"1073":1730,"1074":1751,"1075":1735,"1076":1732,"1077":1733,"1078":1750,"1079":1754,"1080":1737,"1081":1738,"1082":1739,"1083":1740,"1084":1741,"1085":1742,"1086":1743,"1087":1744,"1088":1746,"1089":1747,"1090":1748,"1091":1749,"1092":1734,"1093":1736,"1094":1731,"1095":1758,"1096":1755,"1097":1757,"1098":1759,"1099":1753,"1100":1752,"1101":1756,"1102":1728,"1103":1745,"1105":1699,"1106":1697,"1107":1698,"1108":1700,"1109":1701,"1110":1702,"1111":1703,"1112":1704,"1113":1705,"1114":1706,"1115":1707,"1116":1708,"1118":1710,"1119":1711,"1168":1725,"1169":1709,"1170":16778386,"1171":16778387,"1174":16778390,"1175":16778391,"1178":16778394,"1179":16778395,"1180":16778396,"1181":16778397,"1186":16778402,"1187":16778403,"1198":16778414,"1199":16778415,"1200":16778416,"1201":16778417,"1202":16778418,"1203":16778419,"1206":16778422,"1207":16778423,"1208":16778424,"1209":16778425,"1210":16778426,"1211":16778427,"1240":16778456,"1241":16778457,"1250":16778466,"1251":16778467,"1256":16778472,"1257":16778473,"1262":16778478,"1263":16778479,"1329":16778545,"1330":16778546,"1331":16778547,"1332":16778548,"1333":16778549,"1334":16778550,"1335":16778551,"1336":16778552,"1337":16778553,"1338":16778554,"1339":16778555,"1340":16778556,"1341":16778557,"1342":16778558,"1343":16778559,"1344":16778560,"1345":16778561,"1346":16778562,"1347":16778563,"1348":16778564,"1349":16778565,"1350":16778566,"1351":16778567,"1352":16778568,"1353":16778569,"1354":16778570,"1355":16778571,"1356":16778572,"1357":16778573,"1358":16778574,"1359":16778575,"1360":16778576,"1361":16778577,"1362":16778578,"1363":16778579,"1364":16778580,"1365":16778581,"1366":16778582,"1370":16778586,"1371":16778587,"1372":16778588,"1373":16778589,"1374":16778590,"1377":16778593,"1378":16778594,"1379":16778595,"1380":16778596,"1381":16778597,"1382":16778598,"1383":16778599,"1384":16778600,"1385":16778601,"1386":16778602,"1387":16778603,"1388":16778604,"1389":16778605,"1390":16778606,"1391":16778607,"1392":16778608,"1393":16778609,"1394":16778610,"1395":16778611,"1396":16778612,"1397":16778613,"1398":16778614,"1399":16778615,"1400":16778616,"1401":16778617,"1402":16778618,"1403":16778619,"1404":16778620,"1405":16778621,"1406":16778622,"1407":16778623,"1408":16778624,"1409":16778625,"1410":16778626,"1411":16778627,"1412":16778628,"1413":16778629,"1414":16778630,"1415":16778631,"1417":16778633,"1418":16778634,"1488":3296,"1489":3297,"1490":3298,"1491":3299,"1492":3300,"1493":3301,"1494":3302,"1495":3303,"1496":3304,"1497":3305,"1498":3306,"1499":3307,"1500":3308,"1501":3309,"1502":3310,"1503":3311,"1504":3312,"1505":3313,"1506":3314,"1507":3315,"1508":3316,"1509":3317,"1510":3318,"1511":3319,"1512":3320,"1513":3321,"1514":3322,"1548":1452,"1563":1467,"1567":1471,"1569":1473,"1570":1474,"1571":1475,"1572":1476,"1573":1477,"1574":1478,"1575":1479,"1576":1480,"1577":1481,"1578":1482,"1579":1483,"1580":1484,"1581":1485,"1582":1486,"1583":1487,"1584":1488,"1585":1489,"1586":1490,"1587":1491,"1588":1492,"1589":1493,"1590":1494,"1591":1495,"1592":1496,"1593":1497,"1594":1498,"1600":1504,"1601":1505,"1602":1506,"1603":1507,"1604":1508,"1605":1509,"1606":1510,"1607":1511,"1608":1512,"1609":1513,"1610":1514,"1611":1515,"1612":1516,"1613":1517,"1614":1518,"1615":1519,"1616":1520,"1617":1521,"1618":1522,"1619":16778835,"1620":16778836,"1621":16778837,"1632":16778848,"1633":16778849,"1634":16778850,"1635":16778851,"1636":16778852,"1637":16778853,"1638":16778854,"1639":16778855,"1640":16778856,"1641":16778857,"1642":16778858,"1648":16778864,"1657":16778873,"1662":16778878,"1670":16778886,"1672":16778888,"1681":16778897,"1688":16778904,"1700":16778916,"1705":16778921,"1711":16778927,"1722":16778938,"1726":16778942,"1729":16778945,"1740":16778956,"1746":16778962,"1748":16778964,"1776":16778992,"1777":16778993,"1778":16778994,"1779":16778995,"1780":16778996,"1781":16778997,"1782":16778998,"1783":16778999,"1784":16779000,"1785":16779001,"3458":16780674,"3459":16780675,"3461":16780677,"3462":16780678,"3463":16780679,"3464":16780680,"3465":16780681,"3466":16780682,"3467":16780683,"3468":16780684,"3469":16780685,"3470":16780686,"3471":16780687,"3472":16780688,"3473":16780689,"3474":16780690,"3475":16780691,"3476":16780692,"3477":16780693,"3478":16780694,"3482":16780698,"3483":16780699,"3484":16780700,"3485":16780701,"3486":16780702,"3487":16780703,"3488":16780704,"3489":16780705,"3490":16780706,"3491":16780707,"3492":16780708,"3493":16780709,"3494":16780710,"3495":16780711,"3496":16780712,"3497":16780713,"3498":16780714,"3499":16780715,"3500":16780716,"3501":16780717,"3502":16780718,"3503":16780719,"3504":16780720,"3505":16780721,"3507":16780723,"3508":16780724,"3509":16780725,"3510":16780726,"3511":16780727,"3512":16780728,"3513":16780729,"3514":16780730,"3515":16780731,"3517":16780733,"3520":16780736,"3521":16780737,"3522":16780738,"3523":16780739,"3524":16780740,"3525":16780741,"3526":16780742,"3530":16780746,"3535":16780751,"3536":16780752,"3537":16780753,"3538":16780754,"3539":16780755,"3540":16780756,"3542":16780758,"3544":16780760,"3545":16780761,"3546":16780762,"3547":16780763,"3548":16780764,"3549":16780765,"3550":16780766,"3551":16780767,"3570":16780786,"3571":16780787,"3572":16780788,"3585":3489,"3586":3490,"3587":3491,"3588":3492,"3589":3493,"3590":3494,"3591":3495,"3592":3496,"3593":3497,"3594":3498,"3595":3499,"3596":3500,"3597":3501,"3598":3502,"3599":3503,"3600":3504,"3601":3505,"3602":3506,"3603":3507,"3604":3508,"3605":3509,"3606":3510,"3607":3511,"3608":3512,"3609":3513,"3610":3514,"3611":3515,"3612":3516,"3613":3517,"3614":3518,"3615":3519,"3616":3520,"3617":3521,"3618":3522,"3619":3523,"3620":3524,"3621":3525,"3622":3526,"3623":3527,"3624":3528,"3625":3529,"3626":3530,"3627":3531,"3628":3532,"3629":3533,"3630":3534,"3631":3535,"3632":3536,"3633":3537,"3634":3538,"3635":3539,"3636":3540,"3637":3541,"3638":3542,"3639":3543,"3640":3544,"3641":3545,"3642":3546,"3647":3551,"3648":3552,"3649":3553,"3650":3554,"3651":3555,"3652":3556,"3653":3557,"3654":3558,"3655":3559,"3656":3560,"3657":3561,"3658":3562,"3659":3563,"3660":3564,"3661":3565,"3664":3568,"3665":3569,"3666":3570,"3667":3571,"3668":3572,"3669":3573,"3670":3574,"3671":3575,"3672":3576,"3673":3577,"4304":16781520,"4305":16781521,"4306":16781522,"4307":16781523,"4308":16781524,"4309":16781525,"4310":16781526,"4311":16781527,"4312":16781528,"4313":16781529,"4314":16781530,"4315":16781531,"4316":16781532,"4317":16781533,"4318":16781534,"4319":16781535,"4320":16781536,"4321":16781537,"4322":16781538,"4323":16781539,"4324":16781540,"4325":16781541,"4326":16781542,"4327":16781543,"4328":16781544,"4329":16781545,"4330":16781546,"4331":16781547,"4332":16781548,"4333":16781549,"4334":16781550,"4335":16781551,"4336":16781552,"4337":16781553,"4338":16781554,"4339":16781555,"4340":16781556,"4341":16781557,"4342":16781558,"7682":16784898,"7683":16784899,"7690":16784906,"7691":16784907,"7710":16784926,"7711":16784927,"7734":16784950,"7735":16784951,"7744":16784960,"7745":16784961,"7766":16784982,"7767":16784983,"7776":16784992,"7777":16784993,"7786":16785002,"7787":16785003,"7808":16785024,"7809":16785025,"7810":16785026,"7811":16785027,"7812":16785028,"7813":16785029,"7818":16785034,"7819":16785035,"7840":16785056,"7841":16785057,"7842":16785058,"7843":16785059,"7844":16785060,"7845":16785061,"7846":16785062,"7847":16785063,"7848":16785064,"7849":16785065,"7850":16785066,"7851":16785067,"7852":16785068,"7853":16785069,"7854":16785070,"7855":16785071,"7856":16785072,"7857":16785073,"7858":16785074,"7859":16785075,"7860":16785076,"7861":16785077,"7862":16785078,"7863":16785079,"7864":16785080,"7865":16785081,"7866":16785082,"7867":16785083,"7868":16785084,"7869":16785085,"7870":16785086,"7871":16785087,"7872":16785088,"7873":16785089,"7874":16785090,"7875":16785091,"7876":16785092,"7877":16785093,"7878":16785094,"7879":16785095,"7880":16785096,"7881":16785097,"7882":16785098,"7883":16785099,"7884":16785100,"7885":16785101,"7886":16785102,"7887":16785103,"7888":16785104,"7889":16785105,"7890":16785106,"7891":16785107,"7892":16785108,"7893":16785109,"7894":16785110,"7895":16785111,"7896":16785112,"7897":16785113,"7898":16785114,"7899":16785115,"7900":16785116,"7901":16785117,"7902":16785118,"7903":16785119,"7904":16785120,"7905":16785121,"7906":16785122,"7907":16785123,"7908":16785124,"7909":16785125,"7910":16785126,"7911":16785127,"7912":16785128,"7913":16785129,"7914":16785130,"7915":16785131,"7916":16785132,"7917":16785133,"7918":16785134,"7919":16785135,"7920":16785136,"7921":16785137,"7922":16785138,"7923":16785139,"7924":16785140,"7925":16785141,"7926":16785142,"7927":16785143,"7928":16785144,"7929":16785145,"8194":2722,"8195":2721,"8196":2723,"8197":2724,"8199":2725,"8200":2726,"8201":2727,"8202":2728,"8210":2747,"8211":2730,"8212":2729,"8213":1967,"8215":3295,"8216":2768,"8217":2769,"8218":2813,"8220":2770,"8221":2771,"8222":2814,"8224":2801,"8225":2802,"8226":2790,"8229":2735,"8230":2734,"8240":2773,"8242":2774,"8243":2775,"8248":2812,"8254":1150,"8304":16785520,"8308":16785524,"8309":16785525,"8310":16785526,"8311":16785527,"8312":16785528,"8313":16785529,"8320":16785536,"8321":16785537,"8322":16785538,"8323":16785539,"8324":16785540,"8325":16785541,"8326":16785542,"8327":16785543,"8328":16785544,"8329":16785545,"8352":16785568,"8353":16785569,"8354":16785570,"8355":16785571,"8356":16785572,"8357":16785573,"8358":16785574,"8359":16785575,"8360":16785576,"8361":3839,"8362":16785578,"8363":16785579,"8364":8364,"8453":2744,"8470":1712,"8471":2811,"8478":2772,"8482":2761,"8531":2736,"8532":2737,"8533":2738,"8534":2739,"8535":2740,"8536":2741,"8537":2742,"8538":2743,"8539":2755,"8540":2756,"8541":2757,"8542":2758,"8592":2299,"8593":2300,"8594":2301,"8595":2302,"8658":2254,"8660":2253,"8706":2287,"8709":16785925,"8711":2245,"8712":16785928,"8713":16785929,"8715":16785931,"8728":3018,"8730":2262,"8731":16785947,"8732":16785948,"8733":2241,"8734":2242,"8743":2270,"8744":2271,"8745":2268,"8746":2269,"8747":2239,"8748":16785964,"8749":16785965,"8756":2240,"8757":16785973,"8764":2248,"8771":2249,"8773":16785992,"8775":16785991,"8800":2237,"8801":2255,"8802":16786018,"8803":16786019,"8804":2236,"8805":2238,"8834":2266,"8835":2267,"8866":3068,"8867":3036,"8868":3010,"8869":3022,"8968":3027,"8970":3012,"8981":2810,"8992":2212,"8993":2213,"9109":3020,"9115":2219,"9117":2220,"9118":2221,"9120":2222,"9121":2215,"9123":2216,"9124":2217,"9126":2218,"9128":2223,"9132":2224,"9143":2209,"9146":2543,"9147":2544,"9148":2546,"9149":2547,"9225":2530,"9226":2533,"9227":2537,"9228":2531,"9229":2532,"9251":2732,"9252":2536,"9472":2211,"9474":2214,"9484":2210,"9488":2539,"9492":2541,"9496":2538,"9500":2548,"9508":2549,"9516":2551,"9524":2550,"9532":2542,"9618":2529,"9642":2791,"9643":2785,"9644":2779,"9645":2786,"9646":2783,"9647":2767,"9650":2792,"9651":2787,"9654":2781,"9655":2765,"9660":2793,"9661":2788,"9664":2780,"9665":2764,"9670":2528,"9675":2766,"9679":2782,"9702":2784,"9734":2789,"9742":2809,"9747":2762,"9756":2794,"9758":2795,"9792":2808,"9794":2807,"9827":2796,"9829":2798,"9830":2797,"9837":2806,"9839":2805,"10003":2803,"10007":2804,"10013":2777,"10016":2800,"10216":2748,"10217":2750,"10240":16787456,"10241":16787457,"10242":16787458,"10243":16787459,"10244":16787460,"10245":16787461,"10246":16787462,"10247":16787463,"10248":16787464,"10249":16787465,"10250":16787466,"10251":16787467,"10252":16787468,"10253":16787469,"10254":16787470,"10255":16787471,"10256":16787472,"10257":16787473,"10258":16787474,"10259":16787475,"10260":16787476,"10261":16787477,"10262":16787478,"10263":16787479,"10264":16787480,"10265":16787481,"10266":16787482,"10267":16787483,"10268":16787484,"10269":16787485,"10270":16787486,"10271":16787487,"10272":16787488,"10273":16787489,"10274":16787490,"10275":16787491,"10276":16787492,"10277":16787493,"10278":16787494,"10279":16787495,"10280":16787496,"10281":16787497,"10282":16787498,"10283":16787499,"10284":16787500,"10285":16787501,"10286":16787502,"10287":16787503,"10288":16787504,"10289":16787505,"10290":16787506,"10291":16787507,"10292":16787508,"10293":16787509,"10294":16787510,"10295":16787511,"10296":16787512,"10297":16787513,"10298":16787514,"10299":16787515,"10300":16787516,"10301":16787517,"10302":16787518,"10303":16787519,"10304":16787520,"10305":16787521,"10306":16787522,"10307":16787523,"10308":16787524,"10309":16787525,"10310":16787526,"10311":16787527,"10312":16787528,"10313":16787529,"10314":16787530,"10315":16787531,"10316":16787532,"10317":16787533,"10318":16787534,"10319":16787535,"10320":16787536,"10321":16787537,"10322":16787538,"10323":16787539,"10324":16787540,"10325":16787541,"10326":16787542,"10327":16787543,"10328":16787544,"10329":16787545,"10330":16787546,"10331":16787547,"10332":16787548,"10333":16787549,"10334":16787550,"10335":16787551,"10336":16787552,"10337":16787553,"10338":16787554,"10339":16787555,"10340":16787556,"10341":16787557,"10342":16787558,"10343":16787559,"10344":16787560,"10345":16787561,"10346":16787562,"10347":16787563,"10348":16787564,"10349":16787565,"10350":16787566,"10351":16787567,"10352":16787568,"10353":16787569,"10354":16787570,"10355":16787571,"10356":16787572,"10357":16787573,"10358":16787574,"10359":16787575,"10360":16787576,"10361":16787577,"10362":16787578,"10363":16787579,"10364":16787580,"10365":16787581,"10366":16787582,"10367":16787583,"10368":16787584,"10369":16787585,"10370":16787586,"10371":16787587,"10372":16787588,"10373":16787589,"10374":16787590,"10375":16787591,"10376":16787592,"10377":16787593,"10378":16787594,"10379":16787595,"10380":16787596,"10381":16787597,"10382":16787598,"10383":16787599,"10384":16787600,"10385":16787601,"10386":16787602,"10387":16787603,"10388":16787604,"10389":16787605,"10390":16787606,"10391":16787607,"10392":16787608,"10393":16787609,"10394":16787610,"10395":16787611,"10396":16787612,"10397":16787613,"10398":16787614,"10399":16787615,"10400":16787616,"10401":16787617,"10402":16787618,"10403":16787619,"10404":16787620,"10405":16787621,"10406":16787622,"10407":16787623,"10408":16787624,"10409":16787625,"10410":16787626,"10411":16787627,"10412":16787628,"10413":16787629,"10414":16787630,"10415":16787631,"10416":16787632,"10417":16787633,"10418":16787634,"10419":16787635,"10420":16787636,"10421":16787637,"10422":16787638,"10423":16787639,"10424":16787640,"10425":16787641,"10426":16787642,"10427":16787643,"10428":16787644,"10429":16787645,"10430":16787646,"10431":16787647,"10432":16787648,"10433":16787649,"10434":16787650,"10435":16787651,"10436":16787652,"10437":16787653,"10438":16787654,"10439":16787655,"10440":16787656,"10441":16787657,"10442":16787658,"10443":16787659,"10444":16787660,"10445":16787661,"10446":16787662,"10447":16787663,"10448":16787664,"10449":16787665,"10450":16787666,"10451":16787667,"10452":16787668,"10453":16787669,"10454":16787670,"10455":16787671,"10456":16787672,"10457":16787673,"10458":16787674,"10459":16787675,"10460":16787676,"10461":16787677,"10462":16787678,"10463":16787679,"10464":16787680,"10465":16787681,"10466":16787682,"10467":16787683,"10468":16787684,"10469":16787685,"10470":16787686,"10471":16787687,"10472":16787688,"10473":16787689,"10474":16787690,"10475":16787691,"10476":16787692,"10477":16787693,"10478":16787694,"10479":16787695,"10480":16787696,"10481":16787697,"10482":16787698,"10483":16787699,"10484":16787700,"10485":16787701,"10486":16787702,"10487":16787703,"10488":16787704,"10489":16787705,"10490":16787706,"10491":16787707,"10492":16787708,"10493":16787709,"10494":16787710,"10495":16787711,"12289":1188,"12290":1185,"12300":1186,"12301":1187,"12443":1246,"12444":1247,"12449":1191,"12450":1201,"12451":1192,"12452":1202,"12453":1193,"12454":1203,"12455":1194,"12456":1204,"12457":1195,"12458":1205,"12459":1206,"12461":1207,"12463":1208,"12465":1209,"12467":1210,"12469":1211,"12471":1212,"12473":1213,"12475":1214,"12477":1215,"12479":1216,"12481":1217,"12483":1199,"12484":1218,"12486":1219,"12488":1220,"12490":1221,"12491":1222,"12492":1223,"12493":1224,"12494":1225,"12495":1226,"12498":1227,"12501":1228,"12504":1229,"12507":1230,"12510":1231,"12511":1232,"12512":1233,"12513":1234,"12514":1235,"12515":1196,"12516":1236,"12517":1197,"12518":1237,"12519":1198,"12520":1238,"12521":1239,"12522":1240,"12523":1241,"12524":1242,"12525":1243,"12527":1244,"12530":1190,"12531":1245,"12539":1189,"12540":1200};

    function lookup(k) { return k ? {keysym: k, keyname: keynames ? keynames[k] : k} : undefined; }
    return {
        fromUnicode : function(u) { return lookup(codepoints[u]); },
        lookup : lookup
    };
})();
//End of bower_components/no-vnc/include/keysymdef.js

// bower_components/no-vnc/include/keyboard.js
var kbdUtil = (function() {
    "use strict";

    function substituteCodepoint(cp) {
        // Any Unicode code points which do not have corresponding keysym entries
        // can be swapped out for another code point by adding them to this table
        var substitutions = {
            // {S,s} with comma below -> {S,s} with cedilla
            0x218 : 0x15e,
            0x219 : 0x15f,
            // {T,t} with comma below -> {T,t} with cedilla
            0x21a : 0x162,
            0x21b : 0x163
        };

        var sub = substitutions[cp];
        return sub ? sub : cp;
    }

    function isMac() {
        return navigator && !!(/mac/i).exec(navigator.platform);
    }
    function isWindows() {
        return navigator && !!(/win/i).exec(navigator.platform);
    }
    function isLinux() {
        return navigator && !!(/linux/i).exec(navigator.platform);
    }

    // Return true if a modifier which is not the specified char modifier (and is not shift) is down
    function hasShortcutModifier(charModifier, currentModifiers) {
        var mods = {};
        for (var key in currentModifiers) {
            if (parseInt(key) !== XK_Shift_L) {
                mods[key] = currentModifiers[key];
            }
        }

        var sum = 0;
        for (var k in currentModifiers) {
            if (mods[k]) {
                ++sum;
            }
        }
        if (hasCharModifier(charModifier, mods)) {
            return sum > charModifier.length;
        }
        else {
            return sum > 0;
        }
    }

    // Return true if the specified char modifier is currently down
    function hasCharModifier(charModifier, currentModifiers) {
        if (charModifier.length === 0) { return false; }

        for (var i = 0; i < charModifier.length; ++i) {
            if (!currentModifiers[charModifier[i]]) {
                return false;
            }
        }
        return true;
    }

    // Helper object tracking modifier key state
    // and generates fake key events to compensate if it gets out of sync
    function ModifierSync(charModifier) {
        if (!charModifier) {
            if (isMac()) {
                // on Mac, Option (AKA Alt) is used as a char modifier
                charModifier = [XK_Alt_L];
            }
            else if (isWindows()) {
                // on Windows, Ctrl+Alt is used as a char modifier
                charModifier = [XK_Alt_L, XK_Control_L];
            }
            else if (isLinux()) {
                // on Linux, ISO Level 3 Shift (AltGr) is used as a char modifier
                charModifier = [XK_ISO_Level3_Shift];
            }
            else {
                charModifier = [];
            }
        }

        var state = {};
        state[XK_Control_L] = false;
        state[XK_Alt_L] = false;
        state[XK_ISO_Level3_Shift] = false;
        state[XK_Shift_L] = false;
        state[XK_Meta_L] = false;

        function sync(evt, keysym) {
            var result = [];
            function syncKey(keysym) {
                return {keysym: keysyms.lookup(keysym), type: state[keysym] ? 'keydown' : 'keyup'};
            }

            if (evt.ctrlKey !== undefined &&
                evt.ctrlKey !== state[XK_Control_L] && keysym !== XK_Control_L) {
                state[XK_Control_L] = evt.ctrlKey;
                result.push(syncKey(XK_Control_L));
            }
            if (evt.altKey !== undefined &&
                evt.altKey !== state[XK_Alt_L] && keysym !== XK_Alt_L) {
                state[XK_Alt_L] = evt.altKey;
                result.push(syncKey(XK_Alt_L));
            }
            if (evt.altGraphKey !== undefined &&
                evt.altGraphKey !== state[XK_ISO_Level3_Shift] && keysym !== XK_ISO_Level3_Shift) {
                state[XK_ISO_Level3_Shift] = evt.altGraphKey;
                result.push(syncKey(XK_ISO_Level3_Shift));
            }
            if (evt.shiftKey !== undefined &&
                evt.shiftKey !== state[XK_Shift_L] && keysym !== XK_Shift_L) {
                state[XK_Shift_L] = evt.shiftKey;
                result.push(syncKey(XK_Shift_L));
            }
            if (evt.metaKey !== undefined &&
                evt.metaKey !== state[XK_Meta_L] && keysym !== XK_Meta_L) {
                state[XK_Meta_L] = evt.metaKey;
                result.push(syncKey(XK_Meta_L));
            }
            return result;
        }
        function syncKeyEvent(evt, down) {
            var obj = getKeysym(evt);
            var keysym = obj ? obj.keysym : null;

            // first, apply the event itself, if relevant
            if (keysym !== null && state[keysym] !== undefined) {
                state[keysym] = down;
            }
            return sync(evt, keysym);
        }

        return {
            // sync on the appropriate keyboard event
            keydown: function(evt) { return syncKeyEvent(evt, true);},
            keyup: function(evt) { return syncKeyEvent(evt, false);},
            // Call this with a non-keyboard event (such as mouse events) to use its modifier state to synchronize anyway
            syncAny: function(evt) { return sync(evt);},

            // is a shortcut modifier down?
            hasShortcutModifier: function() { return hasShortcutModifier(charModifier, state); },
            // if a char modifier is down, return the keys it consists of, otherwise return null
            activeCharModifier: function() { return hasCharModifier(charModifier, state) ? charModifier : null; }
        };
    }

    // Get a key ID from a keyboard event
    // May be a string or an integer depending on the available properties
    function getKey(evt){
        if ('keyCode' in evt && 'key' in evt) {
            return evt.key + ':' + evt.keyCode;
        }
        else if ('keyCode' in evt) {
            return evt.keyCode;
        }
        else {
            return evt.key;
        }
    }

    // Get the most reliable keysym value we can get from a key event
    // if char/charCode is available, prefer those, otherwise fall back to key/keyCode/which
    function getKeysym(evt){
        var codepoint;
        if (evt.char && evt.char.length === 1) {
            codepoint = evt.char.charCodeAt();
        }
        else if (evt.charCode) {
            codepoint = evt.charCode;
        }
        else if (evt.keyCode && evt.type === 'keypress') {
            // IE10 stores the char code as keyCode, and has no other useful properties
            codepoint = evt.keyCode;
        }
        if (codepoint) {
            var res = keysyms.fromUnicode(substituteCodepoint(codepoint));
            if (res) {
                return res;
            }
        }
        // we could check evt.key here.
        // Legal values are defined in http://www.w3.org/TR/DOM-Level-3-Events/#key-values-list,
        // so we "just" need to map them to keysym, but AFAIK this is only available in IE10, which also provides evt.key
        // so we don't *need* it yet
        if (evt.keyCode) {
            return keysyms.lookup(keysymFromKeyCode(evt.keyCode, evt.shiftKey));
        }
        if (evt.which) {
            return keysyms.lookup(keysymFromKeyCode(evt.which, evt.shiftKey));
        }
        return null;
    }

    // Given a keycode, try to predict which keysym it might be.
    // If the keycode is unknown, null is returned.
    function keysymFromKeyCode(keycode, shiftPressed) {
        if (typeof(keycode) !== 'number') {
            return null;
        }
        // won't be accurate for azerty
        if (keycode >= 0x30 && keycode <= 0x39) {
            return keycode; // digit
        }
        if (keycode >= 0x41 && keycode <= 0x5a) {
            // remap to lowercase unless shift is down
            return shiftPressed ? keycode : keycode + 32; // A-Z
        }
        if (keycode >= 0x60 && keycode <= 0x69) {
            return XK_KP_0 + (keycode - 0x60); // numpad 0-9
        }

        switch(keycode) {
            case 0x20: return XK_space;
            case 0x6a: return XK_KP_Multiply;
            case 0x6b: return XK_KP_Add;
            case 0x6c: return XK_KP_Separator;
            case 0x6d: return XK_KP_Subtract;
            case 0x6e: return XK_KP_Decimal;
            case 0x6f: return XK_KP_Divide;
            case 0xbb: return XK_plus;
            case 0xbc: return XK_comma;
            case 0xbd: return XK_minus;
            case 0xbe: return XK_period;
        }

        return nonCharacterKey({keyCode: keycode});
    }

    // if the key is a known non-character key (any key which doesn't generate character data)
    // return its keysym value. Otherwise return null
    function nonCharacterKey(evt) {
        // evt.key not implemented yet
        if (!evt.keyCode) { return null; }
        var keycode = evt.keyCode;

        if (keycode >= 0x70 && keycode <= 0x87) {
            return XK_F1 + keycode - 0x70; // F1-F24
        }
        switch (keycode) {

            case 8 : return XK_BackSpace;
            case 13 : return XK_Return;

            case 9 : return XK_Tab;

            case 27 : return XK_Escape;
            case 46 : return XK_Delete;

            case 36 : return XK_Home;
            case 35 : return XK_End;
            case 33 : return XK_Page_Up;
            case 34 : return XK_Page_Down;
            case 45 : return XK_Insert;

            case 37 : return XK_Left;
            case 38 : return XK_Up;
            case 39 : return XK_Right;
            case 40 : return XK_Down;

            case 16 : return XK_Shift_L;
            case 17 : return XK_Control_L;
            case 18 : return XK_Alt_L; // also: Option-key on Mac

            case 224 : return XK_Meta_L;
            case 225 : return XK_ISO_Level3_Shift; // AltGr
            case 91 : return XK_Super_L; // also: Windows-key
            case 92 : return XK_Super_R; // also: Windows-key
            case 93 : return XK_Menu; // also: Windows-Menu, Command on Mac
            default: return null;
        }
    }
    return {
        hasShortcutModifier : hasShortcutModifier,
        hasCharModifier : hasCharModifier,
        ModifierSync : ModifierSync,
        getKey : getKey,
        getKeysym : getKeysym,
        keysymFromKeyCode : keysymFromKeyCode,
        nonCharacterKey : nonCharacterKey,
        substituteCodepoint : substituteCodepoint
    };
})();

// Takes a DOM keyboard event and:
// - determines which keysym it represents
// - determines a keyId  identifying the key that was pressed (corresponding to the key/keyCode properties on the DOM event)
// - synthesizes events to synchronize modifier key state between which modifiers are actually down, and which we thought were down
// - marks each event with an 'escape' property if a modifier was down which should be "escaped"
// - generates a "stall" event in cases where it might be necessary to wait and see if a keypress event follows a keydown
// This information is collected into an object which is passed to the next() function. (one call per event)
function KeyEventDecoder(modifierState, next) {
    "use strict";
    function sendAll(evts) {
        for (var i = 0; i < evts.length; ++i) {
            next(evts[i]);
        }
    }
    function process(evt, type) {
        var result = {type: type};
        var keyId = kbdUtil.getKey(evt);
        if (keyId) {
            result.keyId = keyId;
        }

        var keysym = kbdUtil.getKeysym(evt);

        var hasModifier = modifierState.hasShortcutModifier() || !!modifierState.activeCharModifier();
        // Is this a case where we have to decide on the keysym right away, rather than waiting for the keypress?
        // "special" keys like enter, tab or backspace don't send keypress events,
        // and some browsers don't send keypresses at all if a modifier is down
        if (keysym && (type !== 'keydown' || kbdUtil.nonCharacterKey(evt) || hasModifier)) {
            result.keysym = keysym;
        }

        var isShift = evt.keyCode === 0x10 || evt.key === 'Shift';

        // Should we prevent the browser from handling the event?
        // Doing so on a keydown (in most browsers) prevents keypress from being generated
        // so only do that if we have to.
        var suppress = !isShift && (type !== 'keydown' || modifierState.hasShortcutModifier() || !!kbdUtil.nonCharacterKey(evt));

        // If a char modifier is down on a keydown, we need to insert a stall,
        // so VerifyCharModifier knows to wait and see if a keypress is comnig
        var stall = type === 'keydown' && modifierState.activeCharModifier() && !kbdUtil.nonCharacterKey(evt);

        // if a char modifier is pressed, get the keys it consists of (on Windows, AltGr is equivalent to Ctrl+Alt)
        var active = modifierState.activeCharModifier();

        // If we have a char modifier down, and we're able to determine a keysym reliably
        // then (a) we know to treat the modifier as a char modifier,
        // and (b) we'll have to "escape" the modifier to undo the modifier when sending the char.
        if (active && keysym) {
            var isCharModifier = false;
            for (var i  = 0; i < active.length; ++i) {
                if (active[i] === keysym.keysym) {
                    isCharModifier = true;
                }
            }
            if (type === 'keypress' && !isCharModifier) {
                result.escape = modifierState.activeCharModifier();
            }
        }

        if (stall) {
            // insert a fake "stall" event
            next({type: 'stall'});
        }
        next(result);

        return suppress;
    }

    return {
        keydown: function(evt) {
            sendAll(modifierState.keydown(evt));
            return process(evt, 'keydown');
        },
        keypress: function(evt) {
            return process(evt, 'keypress');
        },
        keyup: function(evt) {
            sendAll(modifierState.keyup(evt));
            return process(evt, 'keyup');
        },
        syncModifiers: function(evt) {
            sendAll(modifierState.syncAny(evt));
        },
        releaseAll: function() { next({type: 'releaseall'}); }
    };
}

// Combines keydown and keypress events where necessary to handle char modifiers.
// On some OS'es, a char modifier is sometimes used as a shortcut modifier.
// For example, on Windows, AltGr is synonymous with Ctrl-Alt. On a Danish keyboard layout, AltGr-2 yields a @, but Ctrl-Alt-D does nothing
// so when used with the '2' key, Ctrl-Alt counts as a char modifier (and should be escaped), but when used with 'D', it does not.
// The only way we can distinguish these cases is to wait and see if a keypress event arrives
// When we receive a "stall" event, wait a few ms before processing the next keydown. If a keypress has also arrived, merge the two
function VerifyCharModifier(next) {
    "use strict";
    var queue = [];
    var timer = null;
    function process() {
        if (timer) {
            return;
        }

        var delayProcess = function () {
            clearTimeout(timer);
            timer = null;
            process();
        };

        while (queue.length !== 0) {
            var cur = queue[0];
            queue = queue.splice(1);
            switch (cur.type) {
            case 'stall':
                // insert a delay before processing available events.
                /* jshint loopfunc: true */
                timer = setTimeout(delayProcess, 5);
                /* jshint loopfunc: false */
                return;
            case 'keydown':
                // is the next element a keypress? Then we should merge the two
                if (queue.length !== 0 && queue[0].type === 'keypress') {
                    // Firefox sends keypress even when no char is generated.
                    // so, if keypress keysym is the same as we'd have guessed from keydown,
                    // the modifier didn't have any effect, and should not be escaped
                    if (queue[0].escape && (!cur.keysym || cur.keysym.keysym !== queue[0].keysym.keysym)) {
                        cur.escape = queue[0].escape;
                    }
                    cur.keysym = queue[0].keysym;
                    queue = queue.splice(1);
                }
                break;
            }

            // swallow stall events, and pass all others to the next stage
            if (cur.type !== 'stall') {
                next(cur);
            }
        }
    }
    return function(evt) {
        queue.push(evt);
        process();
    };
}

// Keeps track of which keys we (and the server) believe are down
// When a keyup is received, match it against this list, to determine the corresponding keysym(s)
// in some cases, a single key may produce multiple keysyms, so the corresponding keyup event must release all of these chars
// key repeat events should be merged into a single entry.
// Because we can't always identify which entry a keydown or keyup event corresponds to, we sometimes have to guess
function TrackKeyState(next) {
    "use strict";
    var state = [];

    return function (evt) {
        var last = state.length !== 0 ? state[state.length-1] : null;

        switch (evt.type) {
        case 'keydown':
            // insert a new entry if last seen key was different.
            if (!last || !evt.keyId || last.keyId !== evt.keyId) {
                last = {keyId: evt.keyId, keysyms: {}};
                state.push(last);
            }
            if (evt.keysym) {
                // make sure last event contains this keysym (a single "logical" keyevent
                // can cause multiple key events to be sent to the VNC server)
                last.keysyms[evt.keysym.keysym] = evt.keysym;
                last.ignoreKeyPress = true;
                next(evt);
            }
            break;
        case 'keypress':
            if (!last) {
                last = {keyId: evt.keyId, keysyms: {}};
                state.push(last);
            }
            if (!evt.keysym) {
                console.log('keypress with no keysym:', evt);
            }

            // If we didn't expect a keypress, and already sent a keydown to the VNC server
            // based on the keydown, make sure to skip this event.
            if (evt.keysym && !last.ignoreKeyPress) {
                last.keysyms[evt.keysym.keysym] = evt.keysym;
                evt.type = 'keydown';
                next(evt);
            }
            break;
        case 'keyup':
            if (state.length === 0) {
                return;
            }
            var idx = null;
            // do we have a matching key tracked as being down?
            for (var i = 0; i !== state.length; ++i) {
                if (state[i].keyId === evt.keyId) {
                    idx = i;
                    break;
                }
            }
            // if we couldn't find a match (it happens), assume it was the last key pressed
            if (idx === null) {
                idx = state.length - 1;
            }

            var item = state.splice(idx, 1)[0];
            // for each keysym tracked by this key entry, clone the current event and override the keysym
            var clone = (function(){
                function Clone(){}
                return function (obj) { Clone.prototype=obj; return new Clone(); };
            }());
            for (var key in item.keysyms) {
                var out = clone(evt);
                out.keysym = item.keysyms[key];
                next(out);
            }
            break;
        case 'releaseall':
            /* jshint shadow: true */
            for (var i = 0; i < state.length; ++i) {
                for (var key in state[i].keysyms) {
                    var keysym = state[i].keysyms[key];
                    next({keyId: 0, keysym: keysym, type: 'keyup'});
                }
            }
            /* jshint shadow: false */
            state = [];
        }
    };
}

// Handles "escaping" of modifiers: if a char modifier is used to produce a keysym (such as AltGr-2 to generate an @),
// then the modifier must be "undone" before sending the @, and "redone" afterwards.
function EscapeModifiers(next) {
    "use strict";
    return function(evt) {
        if (evt.type !== 'keydown' || evt.escape === undefined) {
            next(evt);
            return;
        }
        // undo modifiers
        for (var i = 0; i < evt.escape.length; ++i) {
            next({type: 'keyup', keyId: 0, keysym: keysyms.lookup(evt.escape[i])});
        }
        // send the character event
        next(evt);
        // redo modifiers
        /* jshint shadow: true */
        for (var i = 0; i < evt.escape.length; ++i) {
            next({type: 'keydown', keyId: 0, keysym: keysyms.lookup(evt.escape[i])});
        }
        /* jshint shadow: false */
    };
}
//End of bower_components/no-vnc/include/keyboard.js

// bower_components/no-vnc/include/input.js
/*
 * noVNC: HTML5 VNC client
 * Copyright (C) 2012 Joel Martin
 * Copyright (C) 2013 Samuel Mannehed for Cendio AB
 * Licensed under MPL 2.0 or any later version (see LICENSE.txt)
 */

/*jslint browser: true, white: false */
/*global window, Util */

var Keyboard, Mouse;

(function () {
    "use strict";

    //
    // Keyboard event handler
    //

    Keyboard = function (defaults) {
        this._keyDownList = [];         // List of depressed keys
                                        // (even if they are happy)

        Util.set_defaults(this, defaults, {
            'target': document,
            'focused': true
        });

        // create the keyboard handler
        this._handler = new KeyEventDecoder(kbdUtil.ModifierSync(),
            VerifyCharModifier( /* jshint newcap: false */
                TrackKeyState(
                    EscapeModifiers(this._handleRfbEvent.bind(this))
                )
            )
        ); /* jshint newcap: true */

        // keep these here so we can refer to them later
        this._eventHandlers = {
            'keyup': this._handleKeyUp.bind(this),
            'keydown': this._handleKeyDown.bind(this),
            'keypress': this._handleKeyPress.bind(this),
            'blur': this._allKeysUp.bind(this)
        };
    };

    Keyboard.prototype = {
        // private methods

        _handleRfbEvent: function (e) {
            if (this._onKeyPress) {
                Util.Debug("onKeyPress " + (e.type == 'keydown' ? "down" : "up") +
                           ", keysym: " + e.keysym.keysym + "(" + e.keysym.keyname + ")");
                this._onKeyPress(e.keysym.keysym, e.type == 'keydown');
            }
        },

        _handleKeyDown: function (e) {
            if (!this._focused) { return true; }

            if (this._handler.keydown(e)) {
                // Suppress bubbling/default actions
                Util.stopEvent(e);
                return false;
            } else {
                // Allow the event to bubble and become a keyPress event which
                // will have the character code translated
                return true;
            }
        },

        _handleKeyPress: function (e) {
            if (!this._focused) { return true; }

            if (this._handler.keypress(e)) {
                // Suppress bubbling/default actions
                Util.stopEvent(e);
                return false;
            } else {
                // Allow the event to bubble and become a keyPress event which
                // will have the character code translated
                return true;
            }
        },

        _handleKeyUp: function (e) {
            if (!this._focused) { return true; }

            if (this._handler.keyup(e)) {
                // Suppress bubbling/default actions
                Util.stopEvent(e);
                return false;
            } else {
                // Allow the event to bubble and become a keyPress event which
                // will have the character code translated
                return true;
            }
        },

        _allKeysUp: function () {
            Util.Debug(">> Keyboard.allKeysUp");
            this._handler.releaseAll();
            Util.Debug("<< Keyboard.allKeysUp");
        },

        // Public methods

        grab: function () {
            //Util.Debug(">> Keyboard.grab");
            var c = this._target;

            Util.addEvent(c, 'keydown', this._eventHandlers.keydown);
            Util.addEvent(c, 'keyup', this._eventHandlers.keyup);
            Util.addEvent(c, 'keypress', this._eventHandlers.keypress);

            // Release (key up) if window loses focus
            Util.addEvent(window, 'blur', this._eventHandlers.blur);

            //Util.Debug("<< Keyboard.grab");
        },

        ungrab: function () {
            //Util.Debug(">> Keyboard.ungrab");
            var c = this._target;

            Util.removeEvent(c, 'keydown', this._eventHandlers.keydown);
            Util.removeEvent(c, 'keyup', this._eventHandlers.keyup);
            Util.removeEvent(c, 'keypress', this._eventHandlers.keypress);
            Util.removeEvent(window, 'blur', this._eventHandlers.blur);

            // Release (key up) all keys that are in a down state
            this._allKeysUp();

            //Util.Debug(">> Keyboard.ungrab");
        },

        sync: function (e) {
            this._handler.syncModifiers(e);
        }
    };

    Util.make_properties(Keyboard, [
        ['target',     'wo', 'dom'],  // DOM element that captures keyboard input
        ['focused',    'rw', 'bool'], // Capture and send key events

        ['onKeyPress', 'rw', 'func'] // Handler for key press/release
    ]);

    //
    // Mouse event handler
    //

    Mouse = function (defaults) {
        this._mouseCaptured  = false;

        this._doubleClickTimer = null;
        this._lastTouchPos = null;

        // Configuration attributes
        Util.set_defaults(this, defaults, {
            'target': document,
            'focused': true,
            'scale': 1.0,
            'touchButton': 1
        });

        this._eventHandlers = {
            'mousedown': this._handleMouseDown.bind(this),
            'mouseup': this._handleMouseUp.bind(this),
            'mousemove': this._handleMouseMove.bind(this),
            'mousewheel': this._handleMouseWheel.bind(this),
            'mousedisable': this._handleMouseDisable.bind(this)
        };
    };

    Mouse.prototype = {
        // private methods
        _captureMouse: function () {
            // capturing the mouse ensures we get the mouseup event
            if (this._target.setCapture) {
                this._target.setCapture();
            }

            // some browsers give us mouseup events regardless,
            // so if we never captured the mouse, we can disregard the event
            this._mouseCaptured = true;
        },

        _releaseMouse: function () {
            if (this._target.releaseCapture) {
                this._target.releaseCapture();
            }
            this._mouseCaptured = false;
        },

        _resetDoubleClickTimer: function () {
            this._doubleClickTimer = null;
        },

        _handleMouseButton: function (e, down) {
            if (!this._focused) { return true; }

            if (this._notify) {
                this._notify(e);
            }

            var evt = (e ? e : window.event);
            var pos = Util.getEventPosition(e, this._target, this._scale);

            var bmask;
            if (e.touches || e.changedTouches) {
                // Touch device

                // When two touches occur within 500 ms of each other and are
                // closer than 20 pixels together a double click is triggered.
                if (down == 1) {
                    if (this._doubleClickTimer === null) {
                        this._lastTouchPos = pos;
                    } else {
                        clearTimeout(this._doubleClickTimer);

                        // When the distance between the two touches is small enough
                        // force the position of the latter touch to the position of
                        // the first.

                        var xs = this._lastTouchPos.x - pos.x;
                        var ys = this._lastTouchPos.y - pos.y;
                        var d = Math.sqrt((xs * xs) + (ys * ys));

                        // The goal is to trigger on a certain physical width, the
                        // devicePixelRatio brings us a bit closer but is not optimal.
                        if (d < 20 * window.devicePixelRatio) {
                            pos = this._lastTouchPos;
                        }
                    }
                    this._doubleClickTimer = setTimeout(this._resetDoubleClickTimer.bind(this), 500);
                }
                bmask = this._touchButton;
                // If bmask is set
            } else if (evt.which) {
                /* everything except IE */
                bmask = 1 << evt.button;
            } else {
                /* IE including 9 */
                bmask = (evt.button & 0x1) +      // Left
                        (evt.button & 0x2) * 2 +  // Right
                        (evt.button & 0x4) / 2;   // Middle
            }

            if (this._onMouseButton) {
                Util.Debug("onMouseButton " + (down ? "down" : "up") +
                           ", x: " + pos.x + ", y: " + pos.y + ", bmask: " + bmask);
                this._onMouseButton(pos.x, pos.y, down, bmask);
            }
            Util.stopEvent(e);
            return false;
        },

        _handleMouseDown: function (e) {
            this._captureMouse();
            this._handleMouseButton(e, 1);
        },

        _handleMouseUp: function (e) {
            if (!this._mouseCaptured) { return; }

            this._handleMouseButton(e, 0);
            this._releaseMouse();
        },

        _handleMouseWheel: function (e) {
            if (!this._focused) { return true; }

            if (this._notify) {
                this._notify(e);
            }

            var evt = (e ? e : window.event);
            var pos = Util.getEventPosition(e, this._target, this._scale);
            var wheelData = evt.detail ? evt.detail * -1 : evt.wheelDelta / 40;
            var bmask;
            if (wheelData > 0) {
                bmask = 1 << 3;
            } else {
                bmask = 1 << 4;
            }

            if (this._onMouseButton) {
                this._onMouseButton(pos.x, pos.y, 1, bmask);
                this._onMouseButton(pos.x, pos.y, 0, bmask);
            }
            Util.stopEvent(e);
            return false;
        },

        _handleMouseMove: function (e) {
            if (! this._focused) { return true; }

            if (this._notify) {
                this._notify(e);
            }

            var evt = (e ? e : window.event);
            var pos = Util.getEventPosition(e, this._target, this._scale);
            if (this._onMouseMove) {
                this._onMouseMove(pos.x, pos.y);
            }
            Util.stopEvent(e);
            return false;
        },

        _handleMouseDisable: function (e) {
            if (!this._focused) { return true; }

            var evt = (e ? e : window.event);
            var pos = Util.getEventPosition(e, this._target, this._scale);

            /* Stop propagation if inside canvas area */
            if ((pos.realx >= 0) && (pos.realy >= 0) &&
                (pos.realx < this._target.offsetWidth) &&
                (pos.realy < this._target.offsetHeight)) {
                //Util.Debug("mouse event disabled");
                Util.stopEvent(e);
                return false;
            }

            return true;
        },


        // Public methods
        grab: function () {
            var c = this._target;

            if ('ontouchstart' in document.documentElement) {
                Util.addEvent(c, 'touchstart', this._eventHandlers.mousedown);
                Util.addEvent(window, 'touchend', this._eventHandlers.mouseup);
                Util.addEvent(c, 'touchend', this._eventHandlers.mouseup);
                Util.addEvent(c, 'touchmove', this._eventHandlers.mousemove);
            } else {
                Util.addEvent(c, 'mousedown', this._eventHandlers.mousedown);
                Util.addEvent(window, 'mouseup', this._eventHandlers.mouseup);
                Util.addEvent(c, 'mouseup', this._eventHandlers.mouseup);
                Util.addEvent(c, 'mousemove', this._eventHandlers.mousemove);
                Util.addEvent(c, (Util.Engine.gecko) ? 'DOMMouseScroll' : 'mousewheel',
                              this._eventHandlers.mousewheel);
            }

            /* Work around right and middle click browser behaviors */
            Util.addEvent(document, 'click', this._eventHandlers.mousedisable);
            Util.addEvent(document.body, 'contextmenu', this._eventHandlers.mousedisable);
        },

        ungrab: function () {
            var c = this._target;

            if ('ontouchstart' in document.documentElement) {
                Util.removeEvent(c, 'touchstart', this._eventHandlers.mousedown);
                Util.removeEvent(window, 'touchend', this._eventHandlers.mouseup);
                Util.removeEvent(c, 'touchend', this._eventHandlers.mouseup);
                Util.removeEvent(c, 'touchmove', this._eventHandlers.mousemove);
            } else {
                Util.removeEvent(c, 'mousedown', this._eventHandlers.mousedown);
                Util.removeEvent(window, 'mouseup', this._eventHandlers.mouseup);
                Util.removeEvent(c, 'mouseup', this._eventHandlers.mouseup);
                Util.removeEvent(c, 'mousemove', this._eventHandlers.mousemove);
                Util.removeEvent(c, (Util.Engine.gecko) ? 'DOMMouseScroll' : 'mousewheel',
                                 this._eventHandlers.mousewheel);
            }

            /* Work around right and middle click browser behaviors */
            Util.removeEvent(document, 'click', this._eventHandlers.mousedisable);
            Util.removeEvent(document.body, 'contextmenu', this._eventHandlers.mousedisable);

        }
    };

    Util.make_properties(Mouse, [
        ['target',         'ro', 'dom'],   // DOM element that captures mouse input
        ['notify',         'ro', 'func'],  // Function to call to notify whenever a mouse event is received
        ['focused',        'rw', 'bool'],  // Capture and send mouse clicks/movement
        ['scale',          'rw', 'float'], // Viewport scale factor 0.0 - 1.0

        ['onMouseButton',  'rw', 'func'],  // Handler for mouse button click/release
        ['onMouseMove',    'rw', 'func'],  // Handler for mouse movement
        ['touchButton',    'rw', 'int']    // Button mask (1, 2, 4) for touch devices (0 means ignore clicks)
    ]);
})();
//End of bower_components/no-vnc/include/input.js

// bower_components/no-vnc/include/display.js
/*
 * noVNC: HTML5 VNC client
 * Copyright (C) 2012 Joel Martin
 * Licensed under MPL 2.0 (see LICENSE.txt)
 *
 * See README.md for usage and integration instructions.
 */

/*jslint browser: true, white: false */
/*global Util, Base64, changeCursor */

var Display;

(function () {
    "use strict";

    Display = function (defaults) {
        this._drawCtx = null;
        this._c_forceCanvas = false;

        this._renderQ = [];  // queue drawing actions for in-oder rendering

        // the full frame buffer (logical canvas) size
        this._fb_width = 0;
        this._fb_height = 0;

        // the visible "physical canvas" viewport
        this._viewportLoc = { 'x': 0, 'y': 0, 'w': 0, 'h': 0 };
        this._cleanRect = { 'x1': 0, 'y1': 0, 'x2': -1, 'y2': -1 };

        this._prevDrawStyle = "";
        this._tile = null;
        this._tile16x16 = null;
        this._tile_x = 0;
        this._tile_y = 0;

        Util.set_defaults(this, defaults, {
            'true_color': true,
            'colourMap': [],
            'scale': 1.0,
            'viewport': false,
            'render_mode': ''
        });

        Util.Debug(">> Display.constructor");

        if (!this._target) {
            throw new Error("Target must be set");
        }

        if (typeof this._target === 'string') {
            throw new Error('target must be a DOM element');
        }

        if (!this._target.getContext) {
            throw new Error("no getContext method");
        }

        if (!this._drawCtx) {
            this._drawCtx = this._target.getContext('2d');
        }

        Util.Debug("User Agent: " + navigator.userAgent);
        if (Util.Engine.gecko) { Util.Debug("Browser: gecko " + Util.Engine.gecko); }
        if (Util.Engine.webkit) { Util.Debug("Browser: webkit " + Util.Engine.webkit); }
        if (Util.Engine.trident) { Util.Debug("Browser: trident " + Util.Engine.trident); }
        if (Util.Engine.presto) { Util.Debug("Browser: presto " + Util.Engine.presto); }

        this.clear();

        // Check canvas features
        if ('createImageData' in this._drawCtx) {
            this._render_mode = 'canvas rendering';
        } else {
            throw new Error("Canvas does not support createImageData");
        }

        if (this._prefer_js === null) {
            Util.Info("Prefering javascript operations");
            this._prefer_js = true;
        }

        // Determine browser support for setting the cursor via data URI scheme
        var curDat = [];
        for (var i = 0; i < 8 * 8 * 4; i++) {
            curDat.push(255);
        }
        try {
            var curSave = this._target.style.cursor;
            Display.changeCursor(this._target, curDat, curDat, 2, 2, 8, 8);
            if (this._target.style.cursor) {
                if (this._cursor_uri === null || this._cursor_uri === undefined) {
                    this._cursor_uri = true;
                }
                Util.Info("Data URI scheme cursor supported");
            } else {
                if (this._cursor_uri === null || this._cursor_uri === undefined) {
                    this._cursor_uri = false;
                }
                Util.Warn("Data URI scheme cursor not supported");
            }
            this._target.style.cursor = curSave;
        } catch (exc) {
            Util.Error("Data URI scheme cursor test exception: " + exc);
            this._cursor_uri = false;
        }

        Util.Debug("<< Display.constructor");
    };

    Display.prototype = {
        // Public methods
        viewportChange: function (deltaX, deltaY, width, height) {
            var vp = this._viewportLoc;
            var cr = this._cleanRect;
            var canvas = this._target;

            if (!this._viewport) {
                Util.Debug("Setting viewport to full display region");
                deltaX = -vp.w;  // clamped later of out of bounds
                deltaY = -vp.h;
                width = this._fb_width;
                height = this._fb_height;
            }

            if (typeof(deltaX) === "undefined") { deltaX = 0; }
            if (typeof(deltaY) === "undefined") { deltaY = 0; }
            if (typeof(width) === "undefined") { width = vp.w; }
            if (typeof(height) === "undefined") { height = vp.h; }

            // Size change
            if (width > this._fb_width) { width = this._fb_width; }
            if (height > this._fb_height) { height = this._fb_height; }

            if (vp.w !== width || vp.h !== height) {
                // Change width
                if (width < vp.w &&  cr.x2 > vp.x + width - 1) {
                    cr.x2 = vp.x + width - 1;
                }
                vp.w = width;

                // Change height
                if (height < vp.h &&  cr.y2 > vp.y + height - 1) {
                    cr.y2 = vp.y + height - 1;
                }
                vp.h = height;

                var saveImg = null;
                if (vp.w > 0 && vp.h > 0 && canvas.width > 0 && canvas.height > 0) {
                    var img_width = canvas.width < vp.w ? canvas.width : vp.w;
                    var img_height = canvas.height < vp.h ? canvas.height : vp.h;
                    saveImg = this._drawCtx.getImageData(0, 0, img_width, img_height);
                }

                canvas.width = vp.w;
                canvas.height = vp.h;

                if (saveImg) {
                    this._drawCtx.putImageData(saveImg, 0, 0);
                }
            }

            var vx2 = vp.x + vp.w - 1;
            var vy2 = vp.y + vp.h - 1;

            // Position change

            if (deltaX < 0 && vp.x + deltaX < 0) {
                deltaX = -vp.x;
            }
            if (vx2 + deltaX >= this._fb_width) {
                deltaX -= vx2 + deltaX - this._fb_width + 1;
            }

            if (vp.y + deltaY < 0) {
                deltaY = -vp.y;
            }
            if (vy2 + deltaY >= this._fb_height) {
                deltaY -= (vy2 + deltaY - this._fb_height + 1);
            }

            if (deltaX === 0 && deltaY === 0) {
                return;
            }
            Util.Debug("viewportChange deltaX: " + deltaX + ", deltaY: " + deltaY);

            vp.x += deltaX;
            vx2 += deltaX;
            vp.y += deltaY;
            vy2 += deltaY;

            // Update the clean rectangle
            if (vp.x > cr.x1) {
                cr.x1 = vp.x;
            }
            if (vx2 < cr.x2) {
                cr.x2 = vx2;
            }
            if (vp.y > cr.y1) {
                cr.y1 = vp.y;
            }
            if (vy2 < cr.y2) {
                cr.y2 = vy2;
            }

            var x1, w;
            if (deltaX < 0) {
                // Shift viewport left, redraw left section
                x1 = 0;
                w = -deltaX;
            } else {
                // Shift viewport right, redraw right section
                x1 = vp.w - deltaX;
                w = deltaX;
            }

            var y1, h;
            if (deltaY < 0) {
                // Shift viewport up, redraw top section
                y1 = 0;
                h = -deltaY;
            } else {
                // Shift viewport down, redraw bottom section
                y1 = vp.h - deltaY;
                h = deltaY;
            }

            // Copy the valid part of the viewport to the shifted location
            var saveStyle = this._drawCtx.fillStyle;
            this._drawCtx.fillStyle = "rgb(255,255,255)";
            if (deltaX !== 0) {
                this._drawCtx.drawImage(canvas, 0, 0, vp.w, vp.h, -deltaX, 0, vp.w, vp.h);
                this._drawCtx.fillRect(x1, 0, w, vp.h);
            }
            if (deltaY !== 0) {
                this._drawCtx.drawImage(canvas, 0, 0, vp.w, vp.h, 0, -deltaY, vp.w, vp.h);
                this._drawCtx.fillRect(0, y1, vp.w, h);
            }
            this._drawCtx.fillStyle = saveStyle;
        },

        // Return a map of clean and dirty areas of the viewport and reset the
        // tracking of clean and dirty areas
        //
        // Returns: { 'cleanBox': { 'x': x, 'y': y, 'w': w, 'h': h},
        //            'dirtyBoxes': [{ 'x': x, 'y': y, 'w': w, 'h': h }, ...] }
        getCleanDirtyReset: function () {
            var vp = this._viewportLoc;
            var cr = this._cleanRect;

            var cleanBox = { 'x': cr.x1, 'y': cr.y1,
                             'w': cr.x2 - cr.x1 + 1, 'h': cr.y2 - cr.y1 + 1 };

            var dirtyBoxes = [];
            if (cr.x1 >= cr.x2 || cr.y1 >= cr.y2) {
                // Whole viewport is dirty
                dirtyBoxes.push({ 'x': vp.x, 'y': vp.y, 'w': vp.w, 'h': vp.h });
            } else {
                // Redraw dirty regions
                var vx2 = vp.x + vp.w - 1;
                var vy2 = vp.y + vp.h - 1;

                if (vp.x < cr.x1) {
                    // left side dirty region
                    dirtyBoxes.push({'x': vp.x, 'y': vp.y,
                                     'w': cr.x1 - vp.x + 1, 'h': vp.h});
                }
                if (vx2 > cr.x2) {
                    // right side dirty region
                    dirtyBoxes.push({'x': cr.x2 + 1, 'y': vp.y,
                                     'w': vx2 - cr.x2, 'h': vp.h});
                }
                if(vp.y < cr.y1) {
                    // top/middle dirty region
                    dirtyBoxes.push({'x': cr.x1, 'y': vp.y,
                                     'w': cr.x2 - cr.x1 + 1, 'h': cr.y1 - vp.y});
                }
                if (vy2 > cr.y2) {
                    // bottom/middle dirty region
                    dirtyBoxes.push({'x': cr.x1, 'y': cr.y2 + 1,
                                     'w': cr.x2 - cr.x1 + 1, 'h': vy2 - cr.y2});
                }
            }

            this._cleanRect = {'x1': vp.x, 'y1': vp.y,
                               'x2': vp.x + vp.w - 1, 'y2': vp.y + vp.h - 1};

            return {'cleanBox': cleanBox, 'dirtyBoxes': dirtyBoxes};
        },

        absX: function (x) {
            return x + this._viewportLoc.x;
        },

        absY: function (y) {
            return y + this._viewportLoc.y;
        },

        resize: function (width, height) {
            this._prevDrawStyle = "";

            this._fb_width = width;
            this._fb_height = height;

            this._rescale(this._scale);

            this.viewportChange();
        },

        clear: function () {
            if (this._logo) {
                this.resize(this._logo.width, this._logo.height);
                this.blitStringImage(this._logo.data, 0, 0);
            } else {
                if (Util.Engine.trident === 6) {
                    // NB(directxman12): there's a bug in IE10 where we can fail to actually
                    //                   clear the canvas here because of the resize.
                    //                   Clearing the current viewport first fixes the issue
                    this._drawCtx.clearRect(0, 0, this._viewportLoc.w, this._viewportLoc.h);
                }
                this.resize(240, 20);
                this._drawCtx.clearRect(0, 0, this._viewportLoc.w, this._viewportLoc.h);
            }

            this._renderQ = [];
        },

        fillRect: function (x, y, width, height, color) {
            this._setFillColor(color);
            this._drawCtx.fillRect(x - this._viewportLoc.x, y - this._viewportLoc.y, width, height);
        },

        copyImage: function (old_x, old_y, new_x, new_y, w, h) {
            var x1 = old_x - this._viewportLoc.x;
            var y1 = old_y - this._viewportLoc.y;
            var x2 = new_x - this._viewportLoc.x;
            var y2 = new_y - this._viewportLoc.y;

            this._drawCtx.drawImage(this._target, x1, y1, w, h, x2, y2, w, h);
        },

        // start updating a tile
        startTile: function (x, y, width, height, color) {
            this._tile_x = x;
            this._tile_y = y;
            if (width === 16 && height === 16) {
                this._tile = this._tile16x16;
            } else {
                this._tile = this._drawCtx.createImageData(width, height);
            }

            if (this._prefer_js) {
                var bgr;
                if (this._true_color) {
                    bgr = color;
                } else {
                    bgr = this._colourMap[color[0]];
                }
                var red = bgr[2];
                var green = bgr[1];
                var blue = bgr[0];

                var data = this._tile.data;
                for (var i = 0; i < width * height * 4; i += 4) {
                    data[i] = red;
                    data[i + 1] = green;
                    data[i + 2] = blue;
                    data[i + 3] = 255;
                }
            } else {
                this.fillRect(x, y, width, height, color);
            }
        },

        // update sub-rectangle of the current tile
        subTile: function (x, y, w, h, color) {
            if (this._prefer_js) {
                var bgr;
                if (this._true_color) {
                    bgr = color;
                } else {
                    bgr = this._colourMap[color[0]];
                }
                var red = bgr[2];
                var green = bgr[1];
                var blue = bgr[0];
                var xend = x + w;
                var yend = y + h;

                var data = this._tile.data;
                var width = this._tile.width;
                for (var j = y; j < yend; j++) {
                    for (var i = x; i < xend; i++) {
                        var p = (i + (j * width)) * 4;
                        data[p] = red;
                        data[p + 1] = green;
                        data[p + 2] = blue;
                        data[p + 3] = 255;
                    }
                }
            } else {
                this.fillRect(this._tile_x + x, this._tile_y + y, w, h, color);
            }
        },

        // draw the current tile to the screen
        finishTile: function () {
            if (this._prefer_js) {
                this._drawCtx.putImageData(this._tile, this._tile_x - this._viewportLoc.x,
                                           this._tile_y - this._viewportLoc.y);
            }
            // else: No-op -- already done by setSubTile
        },

        blitImage: function (x, y, width, height, arr, offset) {
            if (this._true_color) {
                this._bgrxImageData(x, y, this._viewportLoc.x, this._viewportLoc.y, width, height, arr, offset);
            } else {
                this._cmapImageData(x, y, this._viewportLoc.x, this._viewportLoc.y, width, height, arr, offset);
            }
        },

        blitRgbImage: function (x, y , width, height, arr, offset) {
            if (this._true_color) {
                this._rgbImageData(x, y, this._viewportLoc.x, this._viewportLoc.y, width, height, arr, offset);
            } else {
                // probably wrong?
                this._cmapImageData(x, y, this._viewportLoc.x, this._viewportLoc.y, width, height, arr, offset);
            }
        },

        blitStringImage: function (str, x, y) {
            var img = new Image();
            img.onload = function () {
                this._drawCtx.drawImage(img, x - this._viewportLoc.x, y - this._viewportLoc.y);
            }.bind(this);
            img.src = str;
            return img; // for debugging purposes
        },

        // wrap ctx.drawImage but relative to viewport
        drawImage: function (img, x, y) {
            this._drawCtx.drawImage(img, x - this._viewportLoc.x, y - this._viewportLoc.y);
        },

        renderQ_push: function (action) {
            this._renderQ.push(action);
            if (this._renderQ.length === 1) {
                // If this can be rendered immediately it will be, otherwise
                // the scanner will start polling the queue (every
                // requestAnimationFrame interval)
                this._scan_renderQ();
            }
        },

        changeCursor: function (pixels, mask, hotx, hoty, w, h) {
            if (this._cursor_uri === false) {
                Util.Warn("changeCursor called but no cursor data URI support");
                return;
            }

            if (this._true_color) {
                Display.changeCursor(this._target, pixels, mask, hotx, hoty, w, h);
            } else {
                Display.changeCursor(this._target, pixels, mask, hotx, hoty, w, h, this._colourMap);
            }
        },

        defaultCursor: function () {
            this._target.style.cursor = "default";
        },

        // Overridden getters/setters
        get_context: function () {
            return this._drawCtx;
        },

        set_scale: function (scale) {
            this._rescale(scale);
        },

        set_width: function (w) {
            this.resize(w, this._fb_height);
        },
        get_width: function () {
            return this._fb_width;
        },

        set_height: function (h) {
            this.resize(this._fb_width, h);
        },
        get_height: function () {
            return this._fb_height;
        },

        // Private Methods
        _rescale: function (factor) {
            var canvas = this._target;
            var properties = ['transform', 'WebkitTransform', 'MozTransform'];
            var transform_prop;
            while ((transform_prop = properties.shift())) {
                if (typeof canvas.style[transform_prop] !== 'undefined') {
                    break;
                }
            }

            if (transform_prop === null) {
                Util.Debug("No scaling support");
                return;
            }

            if (typeof(factor) === "undefined") {
                factor = this._scale;
            } else if (factor > 1.0) {
                factor = 1.0;
            } else if (factor < 0.1) {
                factor = 0.1;
            }

            if (this._scale === factor) {
                return;
            }

            this._scale = factor;
            var x = canvas.width - (canvas.width * factor);
            var y = canvas.height - (canvas.height * factor);
            canvas.style[transform_prop] = 'scale(' + this._scale + ') translate(-' + x + 'px, -' + y + 'px)';
        },

        _setFillColor: function (color) {
            var bgr;
            if (this._true_color) {
                bgr = color;
            } else {
                bgr = this._colourMap[color[0]];
            }

            var newStyle = 'rgb(' + bgr[2] + ',' + bgr[1] + ',' + bgr[0] + ')';
            if (newStyle !== this._prevDrawStyle) {
                this._drawCtx.fillStyle = newStyle;
                this._prevDrawStyle = newStyle;
            }
        },

        _rgbImageData: function (x, y, vx, vy, width, height, arr, offset) {
            var img = this._drawCtx.createImageData(width, height);
            var data = img.data;
            for (var i = 0, j = offset; i < width * height * 4; i += 4, j += 3) {
                data[i]     = arr[j];
                data[i + 1] = arr[j + 1];
                data[i + 2] = arr[j + 2];
                data[i + 3] = 255;  // Alpha
            }
            this._drawCtx.putImageData(img, x - vx, y - vy);
        },

        _bgrxImageData: function (x, y, vx, vy, width, height, arr, offset) {
            var img = this._drawCtx.createImageData(width, height);
            var data = img.data;
            for (var i = 0, j = offset; i < width * height * 4; i += 4, j += 4) {
                data[i]     = arr[j + 2];
                data[i + 1] = arr[j + 1];
                data[i + 2] = arr[j];
                data[i + 3] = 255;  // Alpha
            }
            this._drawCtx.putImageData(img, x - vx, y - vy);
        },

        _cmapImageData: function (x, y, vx, vy, width, height, arr, offset) {
            var img = this._drawCtx.createImageData(width, height);
            var data = img.data;
            var cmap = this._colourMap;
            for (var i = 0, j = offset; i < width * height * 4; i += 4, j++) {
                var bgr = cmap[arr[j]];
                data[i]     = bgr[2];
                data[i + 1] = bgr[1];
                data[i + 2] = bgr[0];
                data[i + 3] = 255;  // Alpha
            }
            this._drawCtx.putImageData(img, x - vx, y - vy);
        },

        _scan_renderQ: function () {
            var ready = true;
            while (ready && this._renderQ.length > 0) {
                var a = this._renderQ[0];
                switch (a.type) {
                    case 'copy':
                        this.copyImage(a.old_x, a.old_y, a.x, a.y, a.width, a.height);
                        break;
                    case 'fill':
                        this.fillRect(a.x, a.y, a.width, a.height, a.color);
                        break;
                    case 'blit':
                        this.blitImage(a.x, a.y, a.width, a.height, a.data, 0);
                        break;
                    case 'blitRgb':
                        this.blitRgbImage(a.x, a.y, a.width, a.height, a.data, 0);
                        break;
                    case 'img':
                        if (a.img.complete) {
                            this.drawImage(a.img, a.x, a.y);
                        } else {
                            // We need to wait for this image to 'load'
                            // to keep things in-order
                            ready = false;
                        }
                        break;
                }

                if (ready) {
                    this._renderQ.shift();
                }
            }

            if (this._renderQ.length > 0) {
                requestAnimFrame(this._scan_renderQ.bind(this));
            }
        },
    };

    Util.make_properties(Display, [
        ['target', 'wo', 'dom'],       // Canvas element for rendering
        ['context', 'ro', 'raw'],      // Canvas 2D context for rendering (read-only)
        ['logo', 'rw', 'raw'],         // Logo to display when cleared: {"width": w, "height": h, "data": data}
        ['true_color', 'rw', 'bool'],  // Use true-color pixel data
        ['colourMap', 'rw', 'arr'],    // Colour map array (when not true-color)
        ['scale', 'rw', 'float'],      // Display area scale factor 0.0 - 1.0
        ['viewport', 'rw', 'bool'],    // Use a viewport set with viewportChange()
        ['width', 'rw', 'int'],        // Display area width
        ['height', 'rw', 'int'],       // Display area height

        ['render_mode', 'ro', 'str'],  // Canvas rendering mode (read-only)

        ['prefer_js', 'rw', 'str'],    // Prefer Javascript over canvas methods
        ['cursor_uri', 'rw', 'raw']    // Can we render cursor using data URI
    ]);

    // Class Methods
    Display.changeCursor = function (target, pixels, mask, hotx, hoty, w0, h0, cmap) {
        var w = w0;
        var h = h0;
        if (h < w) {
            h = w;  // increase h to make it square
        } else {
            w = h;  // increase w to make it square
        }

        var cur = [];

        // Push multi-byte little-endian values
        cur.push16le = function (num) {
            this.push(num & 0xFF, (num >> 8) & 0xFF);
        };
        cur.push32le = function (num) {
            this.push(num & 0xFF,
                      (num >> 8) & 0xFF,
                      (num >> 16) & 0xFF,
                      (num >> 24) & 0xFF);
        };

        var IHDRsz = 40;
        var RGBsz = w * h * 4;
        var XORsz = Math.ceil((w * h) / 8.0);
        var ANDsz = Math.ceil((w * h) / 8.0);

        cur.push16le(0);        // 0: Reserved
        cur.push16le(2);        // 2: .CUR type
        cur.push16le(1);        // 4: Number of images, 1 for non-animated ico

        // Cursor #1 header (ICONDIRENTRY)
        cur.push(w);            // 6: width
        cur.push(h);            // 7: height
        cur.push(0);            // 8: colors, 0 -> true-color
        cur.push(0);            // 9: reserved
        cur.push16le(hotx);     // 10: hotspot x coordinate
        cur.push16le(hoty);     // 12: hotspot y coordinate
        cur.push32le(IHDRsz + RGBsz + XORsz + ANDsz);
                                // 14: cursor data byte size
        cur.push32le(22);       // 18: offset of cursor data in the file

        // Cursor #1 InfoHeader (ICONIMAGE/BITMAPINFO)
        cur.push32le(IHDRsz);   // 22: InfoHeader size
        cur.push32le(w);        // 26: Cursor width
        cur.push32le(h * 2);    // 30: XOR+AND height
        cur.push16le(1);        // 34: number of planes
        cur.push16le(32);       // 36: bits per pixel
        cur.push32le(0);        // 38: Type of compression

        cur.push32le(XORsz + ANDsz);
                                // 42: Size of Image
        cur.push32le(0);        // 46: reserved
        cur.push32le(0);        // 50: reserved
        cur.push32le(0);        // 54: reserved
        cur.push32le(0);        // 58: reserved

        // 62: color data (RGBQUAD icColors[])
        var y, x;
        for (y = h - 1; y >= 0; y--) {
            for (x = 0; x < w; x++) {
                if (x >= w0 || y >= h0) {
                    cur.push(0);  // blue
                    cur.push(0);  // green
                    cur.push(0);  // red
                    cur.push(0);  // alpha
                } else {
                    var idx = y * Math.ceil(w0 / 8) + Math.floor(x / 8);
                    var alpha = (mask[idx] << (x % 8)) & 0x80 ? 255 : 0;
                    if (cmap) {
                        idx = (w0 * y) + x;
                        var rgb = cmap[pixels[idx]];
                        cur.push(rgb[2]);  // blue
                        cur.push(rgb[1]);  // green
                        cur.push(rgb[0]);  // red
                        cur.push(alpha);   // alpha
                    } else {
                        idx = ((w0 * y) + x) * 4;
                        cur.push(pixels[idx + 2]); // blue
                        cur.push(pixels[idx + 1]); // green
                        cur.push(pixels[idx]);     // red
                        cur.push(alpha);           // alpha
                    }
                }
            }
        }

        // XOR/bitmask data (BYTE icXOR[])
        // (ignored, just needs to be the right size)
        for (y = 0; y < h; y++) {
            for (x = 0; x < Math.ceil(w / 8); x++) {
                cur.push(0);
            }
        }

        // AND/bitmask data (BYTE icAND[])
        // (ignored, just needs to be the right size)
        for (y = 0; y < h; y++) {
            for (x = 0; x < Math.ceil(w / 8); x++) {
                cur.push(0);
            }
        }

        var url = 'data:image/x-icon;base64,' + Base64.encode(cur);
        target.style.cursor = 'url(' + url + ')' + hotx + ' ' + hoty + ', default';
    };
})();
//End of bower_components/no-vnc/include/display.js

// bower_components/no-vnc/include/jsunzip.js
/*
 * JSUnzip
 *
 * Copyright (c) 2011 by Erik Moller
 * All Rights Reserved
 *
 * This software is provided 'as-is', without any express
 * or implied warranty.  In no event will the authors be
 * held liable for any damages arising from the use of
 * this software.
 *
 * Permission is granted to anyone to use this software
 * for any purpose, including commercial applications,
 * and to alter it and redistribute it freely, subject to
 * the following restrictions:
 *
 * 1. The origin of this software must not be
 *    misrepresented; you must not claim that you
 *    wrote the original software. If you use this
 *    software in a product, an acknowledgment in
 *    the product documentation would be appreciated
 *    but is not required.
 *
 * 2. Altered source versions must be plainly marked
 *    as such, and must not be misrepresented as
 *    being the original software.
 *
 * 3. This notice may not be removed or altered from
 *    any source distribution.
 */
 
var tinf;

function JSUnzip() {

    this.getInt = function(offset, size) {
        switch (size) {
        case 4:
            return  (this.data.charCodeAt(offset + 3) & 0xff) << 24 | 
                    (this.data.charCodeAt(offset + 2) & 0xff) << 16 | 
                    (this.data.charCodeAt(offset + 1) & 0xff) << 8 | 
                    (this.data.charCodeAt(offset + 0) & 0xff);
            break;
        case 2:
            return  (this.data.charCodeAt(offset + 1) & 0xff) << 8 | 
                    (this.data.charCodeAt(offset + 0) & 0xff);
            break;
        default:
            return this.data.charCodeAt(offset) & 0xff;
            break;
        }
    };

    this.getDOSDate = function(dosdate, dostime) {
        var day = dosdate & 0x1f;
        var month = ((dosdate >> 5) & 0xf) - 1;
        var year = 1980 + ((dosdate >> 9) & 0x7f)
        var second = (dostime & 0x1f) * 2;
        var minute = (dostime >> 5) & 0x3f;
        hour = (dostime >> 11) & 0x1f;
        return new Date(year, month, day, hour, minute, second);
    }

    this.open = function(data) {
        this.data = data;
        this.files = [];

        if (this.data.length < 22)
            return { 'status' : false, 'error' : 'Invalid data' };
        var endOfCentralDirectory = this.data.length - 22;
        while (endOfCentralDirectory >= 0 && this.getInt(endOfCentralDirectory, 4) != 0x06054b50)
            --endOfCentralDirectory;
        if (endOfCentralDirectory < 0)
            return { 'status' : false, 'error' : 'Invalid data' };
        if (this.getInt(endOfCentralDirectory + 4, 2) != 0 || this.getInt(endOfCentralDirectory + 6, 2) != 0)
            return { 'status' : false, 'error' : 'No multidisk support' };

        var entriesInThisDisk = this.getInt(endOfCentralDirectory + 8, 2);
        var centralDirectoryOffset = this.getInt(endOfCentralDirectory + 16, 4);
        var globalCommentLength = this.getInt(endOfCentralDirectory + 20, 2);
        this.comment = this.data.slice(endOfCentralDirectory + 22, endOfCentralDirectory + 22 + globalCommentLength);

        var fileOffset = centralDirectoryOffset;

        for (var i = 0; i < entriesInThisDisk; ++i) {
            if (this.getInt(fileOffset + 0, 4) != 0x02014b50)
                return { 'status' : false, 'error' : 'Invalid data' };
            if (this.getInt(fileOffset + 6, 2) > 20)
                return { 'status' : false, 'error' : 'Unsupported version' };
            if (this.getInt(fileOffset + 8, 2) & 1)
                return { 'status' : false, 'error' : 'Encryption not implemented' };

            var compressionMethod = this.getInt(fileOffset + 10, 2);
            if (compressionMethod != 0 && compressionMethod != 8)
                return { 'status' : false, 'error' : 'Unsupported compression method' };

            var lastModFileTime = this.getInt(fileOffset + 12, 2);
            var lastModFileDate = this.getInt(fileOffset + 14, 2);
            var lastModifiedDate = this.getDOSDate(lastModFileDate, lastModFileTime);

            var crc = this.getInt(fileOffset + 16, 4);
            // TODO: crc

            var compressedSize = this.getInt(fileOffset + 20, 4);
            var uncompressedSize = this.getInt(fileOffset + 24, 4);

            var fileNameLength = this.getInt(fileOffset + 28, 2);
            var extraFieldLength = this.getInt(fileOffset + 30, 2);
            var fileCommentLength = this.getInt(fileOffset + 32, 2);

            var relativeOffsetOfLocalHeader = this.getInt(fileOffset + 42, 4);

            var fileName = this.data.slice(fileOffset + 46, fileOffset + 46 + fileNameLength);
            var fileComment = this.data.slice(fileOffset + 46 + fileNameLength + extraFieldLength, fileOffset + 46 + fileNameLength + extraFieldLength + fileCommentLength);

            if (this.getInt(relativeOffsetOfLocalHeader + 0, 4) != 0x04034b50)
                return { 'status' : false, 'error' : 'Invalid data' };
            var localFileNameLength = this.getInt(relativeOffsetOfLocalHeader + 26, 2);
            var localExtraFieldLength = this.getInt(relativeOffsetOfLocalHeader + 28, 2);
            var localFileContent = relativeOffsetOfLocalHeader + 30 + localFileNameLength + localExtraFieldLength;

            this.files[fileName] = 
            {
                'fileComment' : fileComment,
                'compressionMethod' : compressionMethod,
                'compressedSize' : compressedSize,
                'uncompressedSize' : uncompressedSize,
                'localFileContent' : localFileContent,
                'lastModifiedDate' : lastModifiedDate
            };

            fileOffset += 46 + fileNameLength + extraFieldLength + fileCommentLength;
        }
        return { 'status' : true }
    };     
    

    this.read = function(fileName) {
        var fileInfo = this.files[fileName];
        if (fileInfo) {
            if (fileInfo.compressionMethod == 8) {
                if (!tinf) {
                    tinf = new TINF();
                    tinf.init();
                }
                var result = tinf.uncompress(this.data, fileInfo.localFileContent);
                if (result.status == tinf.OK)
                    return { 'status' : true, 'data' : result.data };
                else
                    return { 'status' : false, 'error' : result.error };
            } else {
                return { 'status' : true, 'data' : this.data.slice(fileInfo.localFileContent, fileInfo.localFileContent + fileInfo.uncompressedSize) };
            }
        }
        return { 'status' : false, 'error' : "File '" + fileName + "' doesn't exist in zip" };
    };
    
};



/*
 * tinflate  -  tiny inflate
 *
 * Copyright (c) 2003 by Joergen Ibsen / Jibz
 * All Rights Reserved
 *
 * http://www.ibsensoftware.com/
 *
 * This software is provided 'as-is', without any express
 * or implied warranty.  In no event will the authors be
 * held liable for any damages arising from the use of
 * this software.
 *
 * Permission is granted to anyone to use this software
 * for any purpose, including commercial applications,
 * and to alter it and redistribute it freely, subject to
 * the following restrictions:
 *
 * 1. The origin of this software must not be
 *    misrepresented; you must not claim that you
 *    wrote the original software. If you use this
 *    software in a product, an acknowledgment in
 *    the product documentation would be appreciated
 *    but is not required.
 *
 * 2. Altered source versions must be plainly marked
 *    as such, and must not be misrepresented as
 *    being the original software.
 *
 * 3. This notice may not be removed or altered from
 *    any source distribution.
 */

/*
 * tinflate javascript port by Erik Moller in May 2011.
 * emoller@opera.com
 * 
 * read_bits() patched by mike@imidio.com to allow
 * reading more then 8 bits (needed in some zlib streams)
 */

"use strict";

function TINF() {
    
this.OK = 0;
this.DATA_ERROR = (-3);
this.WINDOW_SIZE = 32768;

/* ------------------------------ *
 * -- internal data structures -- *
 * ------------------------------ */

this.TREE = function() {
   this.table = new Array(16);  /* table of code length counts */
   this.trans = new Array(288); /* code -> symbol translation table */
};

this.DATA = function(that) {
   this.source = '';
   this.sourceIndex = 0;
   this.tag = 0;
   this.bitcount = 0;

   this.dest = [];
   
   this.history = [];

   this.ltree = new that.TREE(); /* dynamic length/symbol tree */
   this.dtree = new that.TREE(); /* dynamic distance tree */
};

/* --------------------------------------------------- *
 * -- uninitialized global data (static structures) -- *
 * --------------------------------------------------- */

this.sltree = new this.TREE(); /* fixed length/symbol tree */
this.sdtree = new this.TREE(); /* fixed distance tree */

/* extra bits and base tables for length codes */
this.length_bits = new Array(30);
this.length_base = new Array(30);

/* extra bits and base tables for distance codes */
this.dist_bits = new Array(30);
this.dist_base = new Array(30);

/* special ordering of code length codes */
this.clcidx = [
   16, 17, 18, 0, 8, 7, 9, 6,
   10, 5, 11, 4, 12, 3, 13, 2,
   14, 1, 15
];

/* ----------------------- *
 * -- utility functions -- *
 * ----------------------- */

/* build extra bits and base tables */
this.build_bits_base = function(bits, base, delta, first)
{
   var i, sum;

   /* build bits table */
   for (i = 0; i < delta; ++i) bits[i] = 0;
   for (i = 0; i < 30 - delta; ++i) bits[i + delta] = Math.floor(i / delta);

   /* build base table */
   for (sum = first, i = 0; i < 30; ++i)
   {
      base[i] = sum;
      sum += 1 << bits[i];
   }
}

/* build the fixed huffman trees */
this.build_fixed_trees = function(lt, dt)
{
   var i;

   /* build fixed length tree */
   for (i = 0; i < 7; ++i) lt.table[i] = 0;

   lt.table[7] = 24;
   lt.table[8] = 152;
   lt.table[9] = 112;

   for (i = 0; i < 24; ++i) lt.trans[i] = 256 + i;
   for (i = 0; i < 144; ++i) lt.trans[24 + i] = i;
   for (i = 0; i < 8; ++i) lt.trans[24 + 144 + i] = 280 + i;
   for (i = 0; i < 112; ++i) lt.trans[24 + 144 + 8 + i] = 144 + i;

   /* build fixed distance tree */
   for (i = 0; i < 5; ++i) dt.table[i] = 0;

   dt.table[5] = 32;

   for (i = 0; i < 32; ++i) dt.trans[i] = i;
}

/* given an array of code lengths, build a tree */
this.build_tree = function(t, lengths, loffset, num)
{
   var offs = new Array(16);
   var i, sum;

   /* clear code length count table */
   for (i = 0; i < 16; ++i) t.table[i] = 0;

   /* scan symbol lengths, and sum code length counts */
   for (i = 0; i < num; ++i) t.table[lengths[loffset + i]]++;

   t.table[0] = 0;

   /* compute offset table for distribution sort */
   for (sum = 0, i = 0; i < 16; ++i)
   {
      offs[i] = sum;
      sum += t.table[i];
   }

   /* create code->symbol translation table (symbols sorted by code) */
   for (i = 0; i < num; ++i)
   {
      if (lengths[loffset + i]) t.trans[offs[lengths[loffset + i]]++] = i;
   }
}

/* ---------------------- *
 * -- decode functions -- *
 * ---------------------- */

/* get one bit from source stream */
this.getbit = function(d)
{
   var bit;

   /* check if tag is empty */
   if (!d.bitcount--)
   {
      /* load next tag */
      d.tag = d.source[d.sourceIndex++] & 0xff;
      d.bitcount = 7;
   }

   /* shift bit out of tag */
   bit = d.tag & 0x01;
   d.tag >>= 1;

   return bit;
}

/* read a num bit value from a stream and add base */
function read_bits_direct(source, bitcount, tag, idx, num)
{
    var val = 0;
    while (bitcount < 24) {
        tag = tag | (source[idx++] & 0xff) << bitcount;
        bitcount += 8;
    }
    val = tag & (0xffff >> (16 - num));
    tag >>= num;
    bitcount -= num;
    return [bitcount, tag, idx, val];
}
this.read_bits = function(d, num, base)
{
    if (!num)
        return base;

    var ret = read_bits_direct(d.source, d.bitcount, d.tag, d.sourceIndex, num);
    d.bitcount = ret[0];
    d.tag = ret[1];
    d.sourceIndex = ret[2];
    return ret[3] + base;
}

/* given a data stream and a tree, decode a symbol */
this.decode_symbol = function(d, t)
{
    while (d.bitcount < 16) {
        d.tag = d.tag | (d.source[d.sourceIndex++] & 0xff) << d.bitcount;
        d.bitcount += 8;
    }
    
    var sum = 0, cur = 0, len = 0;
    do {
        cur = 2 * cur + ((d.tag & (1 << len)) >> len);

        ++len;

        sum += t.table[len];
        cur -= t.table[len];

    } while (cur >= 0);

    d.tag >>= len;
    d.bitcount -= len;

    return t.trans[sum + cur];
}

/* given a data stream, decode dynamic trees from it */
this.decode_trees = function(d, lt, dt)
{
   var code_tree = new this.TREE();
   var lengths = new Array(288+32);
   var hlit, hdist, hclen;
   var i, num, length;

   /* get 5 bits HLIT (257-286) */
   hlit = this.read_bits(d, 5, 257);

   /* get 5 bits HDIST (1-32) */
   hdist = this.read_bits(d, 5, 1);

   /* get 4 bits HCLEN (4-19) */
   hclen = this.read_bits(d, 4, 4);

   for (i = 0; i < 19; ++i) lengths[i] = 0;

   /* read code lengths for code length alphabet */
   for (i = 0; i < hclen; ++i)
   {
      /* get 3 bits code length (0-7) */
      var clen = this.read_bits(d, 3, 0);

      lengths[this.clcidx[i]] = clen;
   }

   /* build code length tree */
   this.build_tree(code_tree, lengths, 0, 19);

   /* decode code lengths for the dynamic trees */
   for (num = 0; num < hlit + hdist; )
   {
      var sym = this.decode_symbol(d, code_tree);

      switch (sym)
      {
      case 16:
         /* copy previous code length 3-6 times (read 2 bits) */
         {
            var prev = lengths[num - 1];
            for (length = this.read_bits(d, 2, 3); length; --length)
            {
               lengths[num++] = prev;
            }
         }
         break;
      case 17:
         /* repeat code length 0 for 3-10 times (read 3 bits) */
         for (length = this.read_bits(d, 3, 3); length; --length)
         {
            lengths[num++] = 0;
         }
         break;
      case 18:
         /* repeat code length 0 for 11-138 times (read 7 bits) */
         for (length = this.read_bits(d, 7, 11); length; --length)
         {
            lengths[num++] = 0;
         }
         break;
      default:
         /* values 0-15 represent the actual code lengths */
         lengths[num++] = sym;
         break;
      }
   }

   /* build dynamic trees */
   this.build_tree(lt, lengths, 0, hlit);
   this.build_tree(dt, lengths, hlit, hdist);
}

/* ----------------------------- *
 * -- block inflate functions -- *
 * ----------------------------- */

/* given a stream and two trees, inflate a block of data */
this.inflate_block_data = function(d, lt, dt)
{
   // js optimization.
   var ddest = d.dest;
   var ddestlength = ddest.length;

   while (1)
   {
      var sym = this.decode_symbol(d, lt);

      /* check for end of block */
      if (sym == 256)
      {
         return this.OK;
      }

      if (sym < 256)
      {
         ddest[ddestlength++] = sym; // ? String.fromCharCode(sym);
         d.history.push(sym);
      } else {

         var length, dist, offs;
         var i;

         sym -= 257;

         /* possibly get more bits from length code */
         length = this.read_bits(d, this.length_bits[sym], this.length_base[sym]);

         dist = this.decode_symbol(d, dt);

         /* possibly get more bits from distance code */
         offs = d.history.length - this.read_bits(d, this.dist_bits[dist], this.dist_base[dist]);

         if (offs < 0)
             throw ("Invalid zlib offset " + offs);
         
         /* copy match */
         for (i = offs; i < offs + length; ++i) {
            //ddest[ddestlength++] = ddest[i];
            ddest[ddestlength++] = d.history[i];
            d.history.push(d.history[i]);
         }
      }
   }
}

/* inflate an uncompressed block of data */
this.inflate_uncompressed_block = function(d)
{
   var length, invlength;
   var i;

   if (d.bitcount > 7) {
       var overflow = Math.floor(d.bitcount / 8);
       d.sourceIndex -= overflow;
       d.bitcount = 0;
       d.tag = 0;
   }
   
   /* get length */
   length = d.source[d.sourceIndex+1];
   length = 256*length + d.source[d.sourceIndex];

   /* get one's complement of length */
   invlength = d.source[d.sourceIndex+3];
   invlength = 256*invlength + d.source[d.sourceIndex+2];

   /* check length */
   if (length != (~invlength & 0x0000ffff)) return this.DATA_ERROR;

   d.sourceIndex += 4;

   /* copy block */
   for (i = length; i; --i) {
       d.history.push(d.source[d.sourceIndex]);
       d.dest[d.dest.length] = d.source[d.sourceIndex++];
   }

   /* make sure we start next block on a byte boundary */
   d.bitcount = 0;

   return this.OK;
}

/* inflate a block of data compressed with fixed huffman trees */
this.inflate_fixed_block = function(d)
{
   /* decode block using fixed trees */
   return this.inflate_block_data(d, this.sltree, this.sdtree);
}

/* inflate a block of data compressed with dynamic huffman trees */
this.inflate_dynamic_block = function(d)
{
   /* decode trees from stream */
   this.decode_trees(d, d.ltree, d.dtree);

   /* decode block using decoded trees */
   return this.inflate_block_data(d, d.ltree, d.dtree);
}

/* ---------------------- *
 * -- public functions -- *
 * ---------------------- */

/* initialize global (static) data */
this.init = function()
{
   /* build fixed huffman trees */
   this.build_fixed_trees(this.sltree, this.sdtree);

   /* build extra bits and base tables */
   this.build_bits_base(this.length_bits, this.length_base, 4, 3);
   this.build_bits_base(this.dist_bits, this.dist_base, 2, 1);

   /* fix a special case */
   this.length_bits[28] = 0;
   this.length_base[28] = 258;

   this.reset();   
}

this.reset = function()
{
   this.d = new this.DATA(this);
   delete this.header;
}

/* inflate stream from source to dest */
this.uncompress = function(source, offset)
{

   var d = this.d;
   var bfinal;

   /* initialise data */
   d.source = source;
   d.sourceIndex = offset;
   d.bitcount = 0;

   d.dest = [];

   // Skip zlib header at start of stream
   if (typeof this.header == 'undefined') {
       this.header = this.read_bits(d, 16, 0);
       /* byte 0: 0x78, 7 = 32k window size, 8 = deflate */
       /* byte 1: check bits for header and other flags */
   }

   var blocks = 0;
   
   do {

      var btype;
      var res;

      /* read final block flag */
      bfinal = this.getbit(d);

      /* read block type (2 bits) */
      btype = this.read_bits(d, 2, 0);

      /* decompress block */
      switch (btype)
      {
      case 0:
         /* decompress uncompressed block */
         res = this.inflate_uncompressed_block(d);
         break;
      case 1:
         /* decompress block with fixed huffman trees */
         res = this.inflate_fixed_block(d);
         break;
      case 2:
         /* decompress block with dynamic huffman trees */
         res = this.inflate_dynamic_block(d);
         break;
      default:
         return { 'status' : this.DATA_ERROR };
      }

      if (res != this.OK) return { 'status' : this.DATA_ERROR };
      blocks++;
      
   } while (!bfinal && d.sourceIndex < d.source.length);

   d.history = d.history.slice(-this.WINDOW_SIZE);
   
   return { 'status' : this.OK, 'data' : d.dest };
}

};
//End of bower_components/no-vnc/include/jsunzip.js

// bower_components/no-vnc/include/rfb.js
/*
 * noVNC: HTML5 VNC client
 * Copyright (C) 2012 Joel Martin
 * Copyright (C) 2013 Samuel Mannehed for Cendio AB
 * Licensed under MPL 2.0 (see LICENSE.txt)
 *
 * See README.md for usage and integration instructions.
 *
 * TIGHT decoder portion:
 * (c) 2012 Michael Tinglof, Joe Balaz, Les Piech (Mercuri.ca)
 */

/*jslint white: false, browser: true */
/*global window, Util, Display, Keyboard, Mouse, Websock, Websock_native, Base64, DES */

var RFB;

(function () {
    "use strict";
    RFB = function (defaults) {
        if (!defaults) {
            defaults = {};
        }

        this._rfb_host = '';
        this._rfb_port = 5900;
        this._rfb_password = '';
        this._rfb_path = '';

        this._rfb_state = 'disconnected';
        this._rfb_version = 0;
        this._rfb_max_version = 3.8;
        this._rfb_auth_scheme = '';

        this._rfb_tightvnc = false;
        this._rfb_xvp_ver = 0;

        // In preference order
        this._encodings = [
            ['COPYRECT',         0x01 ],
            ['TIGHT',            0x07 ],
            ['TIGHT_PNG',        -260 ],
            ['HEXTILE',          0x05 ],
            ['RRE',              0x02 ],
            ['RAW',              0x00 ],
            ['DesktopSize',      -223 ],
            ['Cursor',           -239 ],

            // Psuedo-encoding settings
            //['JPEG_quality_lo',   -32 ],
            ['JPEG_quality_med',    -26 ],
            //['JPEG_quality_hi',   -23 ],
            //['compress_lo',      -255 ],
            ['compress_hi',        -247 ],
            ['last_rect',          -224 ],
            ['xvp',                -309 ]
        ];

        this._encHandlers = {};
        this._encNames = {};
        this._encStats = {};

        this._sock = null;              // Websock object
        this._display = null;           // Display object
        this._keyboard = null;          // Keyboard input handler object
        this._mouse = null;             // Mouse input handler object
        this._sendTimer = null;         // Send Queue check timer
        this._disconnTimer = null;      // disconnection timer
        this._msgTimer = null;          // queued handle_msg timer

        // Frame buffer update state
        this._FBU = {
            rects: 0,
            subrects: 0,            // RRE
            lines: 0,               // RAW
            tiles: 0,               // HEXTILE
            bytes: 0,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            encoding: 0,
            subencoding: -1,
            background: null,
            zlib: []                // TIGHT zlib streams
        };

        this._fb_Bpp = 4;
        this._fb_depth = 3;
        this._fb_width = 0;
        this._fb_height = 0;
        this._fb_name = "";

        this._rre_chunk_sz = 100;

        this._timing = {
            last_fbu: 0,
            fbu_total: 0,
            fbu_total_cnt: 0,
            full_fbu_total: 0,
            full_fbu_cnt: 0,

            fbu_rt_start: 0,
            fbu_rt_total: 0,
            fbu_rt_cnt: 0,
            pixels: 0
        };

        // Mouse state
        this._mouse_buttonMask = 0;
        this._mouse_arr = [];
        this._viewportDragging = false;
        this._viewportDragPos = {};

        // set the default value on user-facing properties
        Util.set_defaults(this, defaults, {
            'target': 'null',                       // VNC display rendering Canvas object
            'focusContainer': document,             // DOM element that captures keyboard input
            'encrypt': false,                       // Use TLS/SSL/wss encryption
            'true_color': true,                     // Request true color pixel data
            'local_cursor': false,                  // Request locally rendered cursor
            'shared': true,                         // Request shared mode
            'view_only': false,                     // Disable client mouse/keyboard
            'xvp_password_sep': '@',                // Separator for XVP password fields
            'disconnectTimeout': 3,                 // Time (s) to wait for disconnection
            'wsProtocols': ['binary', 'base64'],    // Protocols to use in the WebSocket connection
            'repeaterID': '',                       // [UltraVNC] RepeaterID to connect to
            'viewportDrag': false,                  // Move the viewport on mouse drags

            // Callback functions
            'onUpdateState': function () { },       // onUpdateState(rfb, state, oldstate, statusMsg): state update/change
            'onPasswordRequired': function () { },  // onPasswordRequired(rfb): VNC password is required
            'onClipboard': function () { },         // onClipboard(rfb, text): RFB clipboard contents received
            'onBell': function () { },              // onBell(rfb): RFB Bell message received
            'onFBUReceive': function () { },        // onFBUReceive(rfb, fbu): RFB FBU received but not yet processed
            'onFBUComplete': function () { },       // onFBUComplete(rfb, fbu): RFB FBU received and processed
            'onFBResize': function () { },          // onFBResize(rfb, width, height): frame buffer resized
            'onDesktopName': function () { },       // onDesktopName(rfb, name): desktop name received
            'onXvpInit': function () { },           // onXvpInit(version): XVP extensions active for this connection
        });

        // main setup
        Util.Debug(">> RFB.constructor");

        // populate encHandlers with bound versions
        Object.keys(RFB.encodingHandlers).forEach(function (encName) {
            this._encHandlers[encName] = RFB.encodingHandlers[encName].bind(this);
        }.bind(this));

        // Create lookup tables based on encoding number
        for (var i = 0; i < this._encodings.length; i++) {
            this._encHandlers[this._encodings[i][1]] = this._encHandlers[this._encodings[i][0]];
            this._encNames[this._encodings[i][1]] = this._encodings[i][0];
            this._encStats[this._encodings[i][1]] = [0, 0];
        }

        try {
            this._display = new Display({target: this._target});
        } catch (exc) {
            Util.Error("Display exception: " + exc);
            this._updateState('fatal', "No working Display");
        }

        this._keyboard = new Keyboard({target: this._focusContainer,
                                       onKeyPress: this._handleKeyPress.bind(this)});

        this._mouse = new Mouse({target: this._target,
                                 onMouseButton: this._handleMouseButton.bind(this),
                                 onMouseMove: this._handleMouseMove.bind(this),
                                 notify: this._keyboard.sync.bind(this._keyboard)});

        this._sock = new Websock();
        this._sock.on('message', this._handle_message.bind(this));
        this._sock.on('open', function () {
            if (this._rfb_state === 'connect') {
                this._updateState('ProtocolVersion', "Starting VNC handshake");
            } else {
                this._fail("Got unexpected WebSocket connection");
            }
        }.bind(this));
        this._sock.on('close', function (e) {
            Util.Warn("WebSocket on-close event");
            var msg = "";
            if (e.code) {
                msg = " (code: " + e.code;
                if (e.reason) {
                    msg += ", reason: " + e.reason;
                }
                msg += ")";
            }
            if (this._rfb_state === 'disconnect') {
                this._updateState('disconnected', 'VNC disconnected' + msg);
            } else if (this._rfb_state === 'ProtocolVersion') {
                this._fail('Failed to connect to server' + msg);
            } else if (this._rfb_state in {'failed': 1, 'disconnected': 1}) {
                Util.Error("Received onclose while disconnected" + msg);
            } else {
                this._fail("Server disconnected" + msg);
            }
        }.bind(this));
        this._sock.on('error', function (e) {
            Util.Warn("WebSocket on-error event");
        });

        this._init_vars();

        var rmode = this._display.get_render_mode();
        if (Websock_native) {
            Util.Info("Using native WebSockets");
            this._updateState('loaded', 'noVNC ready: native WebSockets, ' + rmode);
        } else {
            Util.Warn("Using web-socket-js bridge.  Flash version: " + Util.Flash.version);
            if (!Util.Flash || Util.Flash.version < 9) {
                this._updateState('fatal', "WebSockets or <a href='http://get.adobe.com/flashplayer'>Adobe Flash</a> is required");
            } else if (document.location.href.substr(0, 7) === 'file://') {
                this._updateState('fatal', "'file://' URL is incompatible with Adobe Flash");
            } else {
                this._updateState('loaded', 'noVNC ready: WebSockets emulation, ' + rmode);
            }
        }

        Util.Debug("<< RFB.constructor");
    };

    RFB.prototype = {
        // Public methods
        connect: function (host, port, password, path) {
            this._rfb_host = host;
            this._rfb_port = port;
            this._rfb_password = (password !== undefined) ? password : "";
            this._rfb_path = (path !== undefined) ? path : "";

            if (!this._rfb_host || !this._rfb_port) {
                return this._fail("Must set host and port");
            }

            this._updateState('connect');
        },

        disconnect: function () {
            this._updateState('disconnect', 'Disconnecting');
        },

        sendPassword: function (passwd) {
            this._rfb_password = passwd;
            this._rfb_state = 'Authentication';
            setTimeout(this._init_msg.bind(this), 1);
        },

        sendCtrlAltDel: function () {
            if (this._rfb_state !== 'normal' || this._view_only) { return false; }
            Util.Info("Sending Ctrl-Alt-Del");

            var arr = [];
            arr = arr.concat(RFB.messages.keyEvent(XK_Control_L, 1));
            arr = arr.concat(RFB.messages.keyEvent(XK_Alt_L, 1));
            arr = arr.concat(RFB.messages.keyEvent(XK_Delete, 1));
            arr = arr.concat(RFB.messages.keyEvent(XK_Delete, 0));
            arr = arr.concat(RFB.messages.keyEvent(XK_Alt_L, 0));
            arr = arr.concat(RFB.messages.keyEvent(XK_Control_L, 0));
            this._sock.send(arr);
        },

        xvpOp: function (ver, op) {
            if (this._rfb_xvp_ver < ver) { return false; }
            Util.Info("Sending XVP operation " + op + " (version " + ver + ")");
            this._sock.send_string("\xFA\x00" + String.fromCharCode(ver) + String.fromCharCode(op));
            return true;
        },

        xvpShutdown: function () {
            return this.xvpOp(1, 2);
        },

        xvpReboot: function () {
            return this.xvpOp(1, 3);
        },

        xvpReset: function () {
            return this.xvpOp(1, 4);
        },

        // Send a key press. If 'down' is not specified then send a down key
        // followed by an up key.
        sendKey: function (code, down) {
            if (this._rfb_state !== "normal" || this._view_only) { return false; }
            var arr = [];
            if (typeof down !== 'undefined') {
                Util.Info("Sending key code (" + (down ? "down" : "up") + "): " + code);
                arr = arr.concat(RFB.messages.keyEvent(code, down ? 1 : 0));
            } else {
                Util.Info("Sending key code (down + up): " + code);
                arr = arr.concat(RFB.messages.keyEvent(code, 1));
                arr = arr.concat(RFB.messages.keyEvent(code, 0));
            }
            this._sock.send(arr);
        },

        clipboardPasteFrom: function (text) {
            if (this._rfb_state !== 'normal') { return; }
            this._sock.send(RFB.messages.clientCutText(text));
        },

        // Private methods

        _connect: function () {
            Util.Debug(">> RFB.connect");

            var uri;
            if (typeof UsingSocketIO !== 'undefined') {
                uri = 'http';
            } else {
                uri = this._encrypt ? 'wss' : 'ws';
            }

            uri += '://' + this._rfb_host + ':' + this._rfb_port + '/' + this._rfb_path;
            Util.Info("connecting to " + uri);

            this._sock.open(uri, this._wsProtocols);

            Util.Debug("<< RFB.connect");
        },

        _init_vars: function () {
            // reset state
            this._sock.init();

            this._FBU.rects        = 0;
            this._FBU.subrects     = 0;  // RRE and HEXTILE
            this._FBU.lines        = 0;  // RAW
            this._FBU.tiles        = 0;  // HEXTILE
            this._FBU.zlibs        = []; // TIGHT zlib encoders
            this._mouse_buttonMask = 0;
            this._mouse_arr        = [];
            this._rfb_tightvnc     = false;

            // Clear the per connection encoding stats
            var i;
            for (i = 0; i < this._encodings.length; i++) {
                this._encStats[this._encodings[i][1]][0] = 0;
            }

            for (i = 0; i < 4; i++) {
                this._FBU.zlibs[i] = new TINF();
                this._FBU.zlibs[i].init();
            }
        },

        _print_stats: function () {
            Util.Info("Encoding stats for this connection:");
            var i, s;
            for (i = 0; i < this._encodings.length; i++) {
                s = this._encStats[this._encodings[i][1]];
                if (s[0] + s[1] > 0) {
                    Util.Info("    " + this._encodings[i][0] + ": " + s[0] + " rects");
                }
            }

            Util.Info("Encoding stats since page load:");
            for (i = 0; i < this._encodings.length; i++) {
                s = this._encStats[this._encodings[i][1]];
                Util.Info("    " + this._encodings[i][0] + ": " + s[1] + " rects");
            }
        },


        /*
         * Page states:
         *   loaded       - page load, equivalent to disconnected
         *   disconnected - idle state
         *   connect      - starting to connect (to ProtocolVersion)
         *   normal       - connected
         *   disconnect   - starting to disconnect
         *   failed       - abnormal disconnect
         *   fatal        - failed to load page, or fatal error
         *
         * RFB protocol initialization states:
         *   ProtocolVersion
         *   Security
         *   Authentication
         *   password     - waiting for password, not part of RFB
         *   SecurityResult
         *   ClientInitialization - not triggered by server message
         *   ServerInitialization (to normal)
         */
        _updateState: function (state, statusMsg) {
            var oldstate = this._rfb_state;

            if (state === oldstate) {
                // Already here, ignore
                Util.Debug("Already in state '" + state + "', ignoring");
            }

            /*
             * These are disconnected states. A previous connect may
             * asynchronously cause a connection so make sure we are closed.
             */
            if (state in {'disconnected': 1, 'loaded': 1, 'connect': 1,
                          'disconnect': 1, 'failed': 1, 'fatal': 1}) {

                if (this._sendTimer) {
                    clearInterval(this._sendTimer);
                    this._sendTimer = null;
                }

                if (this._msgTimer) {
                    clearInterval(this._msgTimer);
                    this._msgTimer = null;
                }

                if (this._display && this._display.get_context()) {
                    this._keyboard.ungrab();
                    this._mouse.ungrab();
                    this._display.defaultCursor();
                    if (Util.get_logging() !== 'debug' || state === 'loaded') {
                        // Show noVNC logo on load and when disconnected, unless in
                        // debug mode
                        this._display.clear();
                    }
                }

                this._sock.close();
            }

            if (oldstate === 'fatal') {
                Util.Error('Fatal error, cannot continue');
            }

            var cmsg = typeof(statusMsg) !== 'undefined' ? (" Msg: " + statusMsg) : "";
            var fullmsg = "New state '" + state + "', was '" + oldstate + "'." + cmsg;
            if (state === 'failed' || state === 'fatal') {
                Util.Error(cmsg);
            } else {
                Util.Warn(cmsg);
            }

            if (oldstate === 'failed' && state === 'disconnected') {
                // do disconnect action, but stay in failed state
                this._rfb_state = 'failed';
            } else {
                this._rfb_state = state;
            }

            if (this._disconnTimer && this._rfb_state !== 'disconnect') {
                Util.Debug("Clearing disconnect timer");
                clearTimeout(this._disconnTimer);
                this._disconnTimer = null;
            }

            switch (state) {
                case 'normal':
                    if (oldstate === 'disconnected' || oldstate === 'failed') {
                        Util.Error("Invalid transition from 'disconnected' or 'failed' to 'normal'");
                    }
                    break;

                case 'connect':
                    this._init_vars();
                    this._connect();
                    // WebSocket.onopen transitions to 'ProtocolVersion'
                    break;

                case 'disconnect':
                    this._disconnTimer = setTimeout(function () {
                        this._fail("Disconnect timeout");
                    }.bind(this), this._disconnectTimeout * 1000);

                    this._print_stats();

                    // WebSocket.onclose transitions to 'disconnected'
                    break;

                case 'failed':
                    if (oldstate === 'disconnected') {
                        Util.Error("Invalid transition from 'disconnected' to 'failed'");
                    } else if (oldstate === 'normal') {
                        Util.Error("Error while connected.");
                    } else if (oldstate === 'init') {
                        Util.Error("Error while initializing.");
                    }

                    // Make sure we transition to disconnected
                    setTimeout(function () {
                        this._updateState('disconnected');
                    }.bind(this), 50);

                    break;

                default:
                    // No state change action to take
            }

            if (oldstate === 'failed' && state === 'disconnected') {
                this._onUpdateState(this, state, oldstate);
            } else {
                this._onUpdateState(this, state, oldstate, statusMsg);
            }
        },

        _fail: function (msg) {
            this._updateState('failed', msg);
            return false;
        },

        _handle_message: function () {
            if (this._sock.rQlen() === 0) {
                Util.Warn("handle_message called on an empty receive queue");
                return;
            }

            switch (this._rfb_state) {
                case 'disconnected':
                case 'failed':
                    Util.Error("Got data while disconnected");
                    break;
                case 'normal':
                    if (this._normal_msg() && this._sock.rQlen() > 0) {
                        // true means we can continue processing
                        // Give other events a chance to run
                        if (this._msgTimer === null) {
                            Util.Debug("More data to process, creating timer");
                            this._msgTimer = setTimeout(function () {
                                this._msgTimer = null;
                                this._handle_message();
                            }.bind(this), 10);
                        } else {
                            Util.Debug("More data to process, existing timer");
                        }
                    }
                    break;
                default:
                    this._init_msg();
                    break;
            }
        },

        _checkEvents: function () {
            if (this._rfb_state === 'normal' && !this._viewportDragging && this._mouse_arr.length > 0) {
                this._sock.send(this._mouse_arr);
                this._mouse_arr = [];
            }
        },

        _handleKeyPress: function (keysym, down) {
            if (this._view_only) { return; } // View only, skip keyboard, events
            this._sock.send(RFB.messages.keyEvent(keysym, down));
        },

        _handleMouseButton: function (x, y, down, bmask) {
            if (down) {
                this._mouse_buttonMask |= bmask;
            } else {
                this._mouse_buttonMask ^= bmask;
            }

            if (this._viewportDrag) {
                if (down && !this._viewportDragging) {
                    this._viewportDragging = true;
                    this._viewportDragPos = {'x': x, 'y': y};

                    // Skip sending mouse events
                    return;
                } else {
                    this._viewportDragging = false;
                }
            }

            if (this._view_only) { return; } // View only, skip mouse events

            this._mouse_arr = this._mouse_arr.concat(
                    RFB.messages.pointerEvent(this._display.absX(x), this._display.absY(y), this._mouse_buttonMask));
            this._sock.send(this._mouse_arr);
            this._mouse_arr = [];
        },

        _handleMouseMove: function (x, y) {
            if (this._viewportDragging) {
                var deltaX = this._viewportDragPos.x - x;
                var deltaY = this._viewportDragPos.y - y;
                this._viewportDragPos = {'x': x, 'y': y};

                this._display.viewportChange(deltaX, deltaY);

                // Skip sending mouse events
                return;
            }

            if (this._view_only) { return; } // View only, skip mouse events

            this._mouse_arr = this._mouse_arr.concat(
                    RFB.messages.pointerEvent(this._display.absX(x), this._display.absY(y), this._mouse_buttonMask));

            this._checkEvents();
        },

        // Message Handlers

        _negotiate_protocol_version: function () {
            if (this._sock.rQlen() < 12) {
                return this._fail("Incomplete protocol version");
            }

            var sversion = this._sock.rQshiftStr(12).substr(4, 7);
            Util.Info("Server ProtocolVersion: " + sversion);
            var is_repeater = 0;
            switch (sversion) {
                case "000.000":  // UltraVNC repeater
                    is_repeater = 1;
                    break;
                case "003.003":
                case "003.006":  // UltraVNC
                case "003.889":  // Apple Remote Desktop
                    this._rfb_version = 3.3;
                    break;
                case "003.007":
                    this._rfb_version = 3.7;
                    break;
                case "003.008":
                case "004.000":  // Intel AMT KVM
                case "004.001":  // RealVNC 4.6
                    this._rfb_version = 3.8;
                    break;
                default:
                    return this._fail("Invalid server version " + sversion);
            }

            if (is_repeater) {
                var repeaterID = this._repeaterID;
                while (repeaterID.length < 250) {
                    repeaterID += "\0";
                }
                this._sock.send_string(repeaterID);
                return true;
            }

            if (this._rfb_version > this._rfb_max_version) {
                this._rfb_version = this._rfb_max_version;
            }

            // Send updates either at a rate of 1 update per 50ms, or
            // whatever slower rate the network can handle
            this._sendTimer = setInterval(this._sock.flush.bind(this._sock), 50);

            var cversion = "00" + parseInt(this._rfb_version, 10) +
                           ".00" + ((this._rfb_version * 10) % 10);
            this._sock.send_string("RFB " + cversion + "\n");
            this._updateState('Security', 'Sent ProtocolVersion: ' + cversion);
        },

        _negotiate_security: function () {
            if (this._rfb_version >= 3.7) {
                // Server sends supported list, client decides
                var num_types = this._sock.rQshift8();
                if (this._sock.rQwait("security type", num_types, 1)) { return false; }

                if (num_types === 0) {
                    var strlen = this._sock.rQshift32();
                    var reason = this._sock.rQshiftStr(strlen);
                    return this._fail("Security failure: " + reason);
                }

                this._rfb_auth_scheme = 0;
                var types = this._sock.rQshiftBytes(num_types);
                Util.Debug("Server security types: " + types);
                for (var i = 0; i < types.length; i++) {
                    if (types[i] > this._rfb_auth_scheme && (types[i] <= 16 || types[i] == 22)) {
                        this._rfb_auth_scheme = types[i];
                    }
                }

                if (this._rfb_auth_scheme === 0) {
                    return this._fail("Unsupported security types: " + types);
                }

                this._sock.send([this._rfb_auth_scheme]);
            } else {
                // Server decides
                if (this._sock.rQwait("security scheme", 4)) { return false; }
                this._rfb_auth_scheme = this._sock.rQshift32();
            }

            this._updateState('Authentication', 'Authenticating using scheme: ' + this._rfb_auth_scheme);
            return this._init_msg(); // jump to authentication
        },

        // authentication
        _negotiate_xvp_auth: function () {
            var xvp_sep = this._xvp_password_sep;
            var xvp_auth = this._rfb_password.split(xvp_sep);
            if (xvp_auth.length < 3) {
                this._updateState('password', 'XVP credentials required (user' + xvp_sep +
                                  'target' + xvp_sep + 'password) -- got only ' + this._rfb_password);
                this._onPasswordRequired(this);
                return false;
            }

            var xvp_auth_str = String.fromCharCode(xvp_auth[0].length) +
                               String.fromCharCode(xvp_auth[1].length) +
                               xvp_auth[0] +
                               xvp_auth[1];
            this._sock.send_string(xvp_auth_str);
            this._rfb_password = xvp_auth.slice(2).join(xvp_sep);
            this._rfb_auth_scheme = 2;
            return this._negotiate_authentication();
        },

        _negotiate_std_vnc_auth: function () {
            if (this._rfb_password.length === 0) {
                // Notify via both callbacks since it's kind of
                // an RFB state change and a UI interface issue
                this._updateState('password', "Password Required");
                this._onPasswordRequired(this);
            }

            if (this._sock.rQwait("auth challenge", 16)) { return false; }

            var challenge = this._sock.rQshiftBytes(16);
            var response = RFB.genDES(this._rfb_password, challenge);
            this._sock.send(response);
            this._updateState("SecurityResult");
            return true;
        },

        _negotiate_tight_tunnels: function (numTunnels) {
            var clientSupportedTunnelTypes = {
                0: { vendor: 'TGHT', signature: 'NOTUNNEL' }
            };
            var serverSupportedTunnelTypes = {};
            // receive tunnel capabilities
            for (var i = 0; i < numTunnels; i++) {
                var cap_code = this._sock.rQshift32();
                var cap_vendor = this._sock.rQshiftStr(4);
                var cap_signature = this._sock.rQshiftStr(8);
                serverSupportedTunnelTypes[cap_code] = { vendor: cap_vendor, signature: cap_signature };
            }

            // choose the notunnel type
            if (serverSupportedTunnelTypes[0]) {
                if (serverSupportedTunnelTypes[0].vendor != clientSupportedTunnelTypes[0].vendor ||
                    serverSupportedTunnelTypes[0].signature != clientSupportedTunnelTypes[0].signature) {
                    return this._fail("Client's tunnel type had the incorrect vendor or signature");
                }
                this._sock.send([0, 0, 0, 0]);  // use NOTUNNEL
                return false; // wait until we receive the sub auth count to continue
            } else {
                return this._fail("Server wanted tunnels, but doesn't support the notunnel type");
            }
        },

        _negotiate_tight_auth: function () {
            if (!this._rfb_tightvnc) {  // first pass, do the tunnel negotiation
                if (this._sock.rQwait("num tunnels", 4)) { return false; }
                var numTunnels = this._sock.rQshift32();
                if (numTunnels > 0 && this._sock.rQwait("tunnel capabilities", 16 * numTunnels, 4)) { return false; }

                this._rfb_tightvnc = true;

                if (numTunnels > 0) {
                    this._negotiate_tight_tunnels(numTunnels);
                    return false;  // wait until we receive the sub auth to continue
                }
            }

            // second pass, do the sub-auth negotiation
            if (this._sock.rQwait("sub auth count", 4)) { return false; }
            var subAuthCount = this._sock.rQshift32();
            if (this._sock.rQwait("sub auth capabilities", 16 * subAuthCount, 4)) { return false; }

            var clientSupportedTypes = {
                'STDVNOAUTH__': 1,
                'STDVVNCAUTH_': 2
            };

            var serverSupportedTypes = [];

            for (var i = 0; i < subAuthCount; i++) {
                var capNum = this._sock.rQshift32();
                var capabilities = this._sock.rQshiftStr(12);
                serverSupportedTypes.push(capabilities);
            }

            for (var authType in clientSupportedTypes) {
                if (serverSupportedTypes.indexOf(authType) != -1) {
                    this._sock.send([0, 0, 0, clientSupportedTypes[authType]]);

                    switch (authType) {
                        case 'STDVNOAUTH__':  // no auth
                            this._updateState('SecurityResult');
                            return true;
                        case 'STDVVNCAUTH_': // VNC auth
                            this._rfb_auth_scheme = 2;
                            return this._init_msg();
                        default:
                            return this._fail("Unsupported tiny auth scheme: " + authType);
                    }
                }
            }

            this._fail("No supported sub-auth types!");
        },

        _negotiate_authentication: function () {
            switch (this._rfb_auth_scheme) {
                case 0:  // connection failed
                    if (this._sock.rQwait("auth reason", 4)) { return false; }
                    var strlen = this._sock.rQshift32();
                    var reason = this._sock.rQshiftStr(strlen);
                    return this._fail("Auth failure: " + reason);

                case 1:  // no auth
                    if (this._rfb_version >= 3.8) {
                        this._updateState('SecurityResult');
                        return true;
                    }
                    this._updateState('ClientInitialisation', "No auth required");
                    return this._init_msg();

                case 22:  // XVP auth
                    return this._negotiate_xvp_auth();

                case 2:  // VNC authentication
                    return this._negotiate_std_vnc_auth();

                case 16:  // TightVNC Security Type
                    return this._negotiate_tight_auth();

                default:
                    return this._fail("Unsupported auth scheme: " + this._rfb_auth_scheme);
            }
        },

        _handle_security_result: function () {
            if (this._sock.rQwait('VNC auth response ', 4)) { return false; }
            switch (this._sock.rQshift32()) {
                case 0:  // OK
                    this._updateState('ClientInitialisation', 'Authentication OK');
                    return this._init_msg();
                case 1:  // failed
                    if (this._rfb_version >= 3.8) {
                        var length = this._sock.rQshift32();
                        if (this._sock.rQwait("SecurityResult reason", length, 8)) { return false; }
                        var reason = this._sock.rQshiftStr(length);
                        return this._fail(reason);
                    } else {
                        return this._fail("Authentication failure");
                    }
                    return false;
                case 2:
                    return this._fail("Too many auth attempts");
            }
        },

        _negotiate_server_init: function () {
            if (this._sock.rQwait("server initialization", 24)) { return false; }

            /* Screen size */
            this._fb_width  = this._sock.rQshift16();
            this._fb_height = this._sock.rQshift16();

            /* PIXEL_FORMAT */
            var bpp         = this._sock.rQshift8();
            var depth       = this._sock.rQshift8();
            var big_endian  = this._sock.rQshift8();
            var true_color  = this._sock.rQshift8();

            var red_max     = this._sock.rQshift16();
            var green_max   = this._sock.rQshift16();
            var blue_max    = this._sock.rQshift16();
            var red_shift   = this._sock.rQshift8();
            var green_shift = this._sock.rQshift8();
            var blue_shift  = this._sock.rQshift8();
            this._sock.rQskipBytes(3);  // padding

            // NB(directxman12): we don't want to call any callbacks or print messages until
            //                   *after* we're past the point where we could backtrack

            /* Connection name/title */
            var name_length = this._sock.rQshift32();
            if (this._sock.rQwait('server init name', name_length, 24)) { return false; }
            this._fb_name = Util.decodeUTF8(this._sock.rQshiftStr(name_length));

            if (this._rfb_tightvnc) {
                if (this._sock.rQwait('TightVNC extended server init header', 8, 24 + name_length)) { return false; }
                // In TightVNC mode, ServerInit message is extended
                var numServerMessages = this._sock.rQshift16();
                var numClientMessages = this._sock.rQshift16();
                var numEncodings = this._sock.rQshift16();
                this._sock.rQskipBytes(2);  // padding

                var totalMessagesLength = (numServerMessages + numClientMessages + numEncodings) * 16;
                if (this._sock.rQwait('TightVNC extended server init header', totalMessagesLength, 32 + name_length)) { return false; }

                var i;
                for (i = 0; i < numServerMessages; i++) {
                    var srvMsg = this._sock.rQshiftStr(16);
                }

                for (i = 0; i < numClientMessages; i++) {
                    var clientMsg = this._sock.rQshiftStr(16);
                }

                for (i = 0; i < numEncodings; i++) {
                    var encoding = this._sock.rQshiftStr(16);
                }
            }

            // NB(directxman12): these are down here so that we don't run them multiple times
            //                   if we backtrack
            Util.Info("Screen: " + this._fb_width + "x" + this._fb_height +
                      ", bpp: " + bpp + ", depth: " + depth +
                      ", big_endian: " + big_endian +
                      ", true_color: " + true_color +
                      ", red_max: " + red_max +
                      ", green_max: " + green_max +
                      ", blue_max: " + blue_max +
                      ", red_shift: " + red_shift +
                      ", green_shift: " + green_shift +
                      ", blue_shift: " + blue_shift);

            if (big_endian !== 0) {
                Util.Warn("Server native endian is not little endian");
            }

            if (red_shift !== 16) {
                Util.Warn("Server native red-shift is not 16");
            }

            if (blue_shift !== 0) {
                Util.Warn("Server native blue-shift is not 0");
            }

            // we're past the point where we could backtrack, so it's safe to call this
            this._onDesktopName(this, this._fb_name);

            if (this._true_color && this._fb_name === "Intel(r) AMT KVM") {
                Util.Warn("Intel AMT KVM only supports 8/16 bit depths.  Disabling true color");
                this._true_color = false;
            }

            this._display.set_true_color(this._true_color);
            this._onFBResize(this, this._fb_width, this._fb_height);
            this._display.resize(this._fb_width, this._fb_height);
            this._keyboard.grab();
            this._mouse.grab();

            if (this._true_color) {
                this._fb_Bpp = 4;
                this._fb_depth = 3;
            } else {
                this._fb_Bpp = 1;
                this._fb_depth = 1;
            }

            var response = RFB.messages.pixelFormat(this._fb_Bpp, this._fb_depth, this._true_color);
            response = response.concat(
                            RFB.messages.clientEncodings(this._encodings, this._local_cursor, this._true_color));
            response = response.concat(
                            RFB.messages.fbUpdateRequests(this._display.getCleanDirtyReset(),
                                                          this._fb_width, this._fb_height));

            this._timing.fbu_rt_start = (new Date()).getTime();
            this._timing.pixels = 0;
            this._sock.send(response);

            this._checkEvents();

            if (this._encrypt) {
                this._updateState('normal', 'Connected (encrypted) to: ' + this._fb_name);
            } else {
                this._updateState('normal', 'Connected (unencrypted) to: ' + this._fb_name);
            }
        },

        _init_msg: function () {
            switch (this._rfb_state) {
                case 'ProtocolVersion':
                    return this._negotiate_protocol_version();

                case 'Security':
                    return this._negotiate_security();

                case 'Authentication':
                    return this._negotiate_authentication();

                case 'SecurityResult':
                    return this._handle_security_result();

                case 'ClientInitialisation':
                    this._sock.send([this._shared ? 1 : 0]); // ClientInitialisation
                    this._updateState('ServerInitialisation', "Authentication OK");
                    return true;

                case 'ServerInitialisation':
                    return this._negotiate_server_init();
            }
        },

        _handle_set_colour_map_msg: function () {
            Util.Debug("SetColorMapEntries");
            this._sock.rQskip8();  // Padding

            var first_colour = this._sock.rQshift16();
            var num_colours = this._sock.rQshift16();
            if (this._sock.rQwait('SetColorMapEntries', num_colours * 6, 6)) { return false; }

            for (var c = 0; c < num_colours; c++) {
                var red = parseInt(this._sock.rQshift16() / 256, 10);
                var green = parseInt(this._sock.rQshift16() / 256, 10);
                var blue = parseInt(this._sock.rQshift16() / 256, 10);
                this._display.set_colourMap([blue, green, red], first_colour + c);
            }
            Util.Debug("colourMap: " + this._display.get_colourMap());
            Util.Info("Registered " + num_colours + " colourMap entries");

            return true;
        },

        _handle_server_cut_text: function () {
            Util.Debug("ServerCutText");
            if (this._sock.rQwait("ServerCutText header", 7, 1)) { return false; }
            this._sock.rQskipBytes(3);  // Padding
            var length = this._sock.rQshift32();
            if (this._sock.rQwait("ServerCutText", length, 8)) { return false; }

            var text = this._sock.rQshiftStr(length);
            this._onClipboard(this, text);

            return true;
        },

        _handle_xvp_msg: function () {
            if (this._sock.rQwait("XVP version and message", 3, 1)) { return false; }
            this._sock.rQskip8();  // Padding
            var xvp_ver = this._sock.rQshift8();
            var xvp_msg = this._sock.rQshift8();

            switch (xvp_msg) {
                case 0:  // XVP_FAIL
                    this._updateState(this._rfb_state, "Operation Failed");
                    break;
                case 1:  // XVP_INIT
                    this._rfb_xvp_ver = xvp_ver;
                    Util.Info("XVP extensions enabled (version " + this._rfb_xvp_ver + ")");
                    this._onXvpInit(this._rfb_xvp_ver);
                    break;
                default:
                    this._fail("Disconnected: illegal server XVP message " + xvp_msg);
                    break;
            }

            return true;
        },

        _normal_msg: function () {
            var msg_type;

            if (this._FBU.rects > 0) {
                msg_type = 0;
            } else {
                msg_type = this._sock.rQshift8();
            }

            switch (msg_type) {
                case 0:  // FramebufferUpdate
                    var ret = this._framebufferUpdate();
                    if (ret) {
                        this._sock.send(RFB.messages.fbUpdateRequests(this._display.getCleanDirtyReset(),
                                                                      this._fb_width, this._fb_height));
                    }
                    return ret;

                case 1:  // SetColorMapEntries
                    return this._handle_set_colour_map_msg();

                case 2:  // Bell
                    Util.Debug("Bell");
                    this._onBell(this);
                    return true;

                case 3:  // ServerCutText
                    return this._handle_server_cut_text();

                case 250:  // XVP
                    return this._handle_xvp_msg();

                default:
                    this._fail("Disconnected: illegal server message type " + msg_type);
                    Util.Debug("sock.rQslice(0, 30): " + this._sock.rQslice(0, 30));
                    return true;
            }
        },

        _framebufferUpdate: function () {
            var ret = true;
            var now;

            if (this._FBU.rects === 0) {
                if (this._sock.rQwait("FBU header", 3, 1)) { return false; }
                this._sock.rQskip8();  // Padding
                this._FBU.rects = this._sock.rQshift16();
                this._FBU.bytes = 0;
                this._timing.cur_fbu = 0;
                if (this._timing.fbu_rt_start > 0) {
                    now = (new Date()).getTime();
                    Util.Info("First FBU latency: " + (now - this._timing.fbu_rt_start));
                }
            }

            while (this._FBU.rects > 0) {
                if (this._rfb_state !== "normal") { return false; }

                if (this._sock.rQwait("FBU", this._FBU.bytes)) { return false; }
                if (this._FBU.bytes === 0) {
                    if (this._sock.rQwait("rect header", 12)) { return false; }
                    /* New FramebufferUpdate */

                    var hdr = this._sock.rQshiftBytes(12);
                    this._FBU.x        = (hdr[0] << 8) + hdr[1];
                    this._FBU.y        = (hdr[2] << 8) + hdr[3];
                    this._FBU.width    = (hdr[4] << 8) + hdr[5];
                    this._FBU.height   = (hdr[6] << 8) + hdr[7];
                    this._FBU.encoding = parseInt((hdr[8] << 24) + (hdr[9] << 16) +
                                                  (hdr[10] << 8) + hdr[11], 10);

                    this._onFBUReceive(this,
                        {'x': this._FBU.x, 'y': this._FBU.y,
                         'width': this._FBU.width, 'height': this._FBU.height,
                         'encoding': this._FBU.encoding,
                         'encodingName': this._encNames[this._FBU.encoding]});

                    if (!this._encNames[this._FBU.encoding]) {
                        this._fail("Disconnected: unsupported encoding " +
                                   this._FBU.encoding);
                        return false;
                    }
                }

                this._timing.last_fbu = (new Date()).getTime();

                ret = this._encHandlers[this._FBU.encoding]();

                now = (new Date()).getTime();
                this._timing.cur_fbu += (now - this._timing.last_fbu);

                if (ret) {
                    this._encStats[this._FBU.encoding][0]++;
                    this._encStats[this._FBU.encoding][1]++;
                    this._timing.pixels += this._FBU.width * this._FBU.height;
                }

                if (this._timing.pixels >= (this._fb_width * this._fb_height)) {
                    if ((this._FBU.width === this._fb_width && this._FBU.height === this._fb_height) ||
                        this._timing.fbu_rt_start > 0) {
                        this._timing.full_fbu_total += this._timing.cur_fbu;
                        this._timing.full_fbu_cnt++;
                        Util.Info("Timing of full FBU, curr: " +
                                  this._timing.cur_fbu + ", total: " +
                                  this._timing.full_fbu_total + ", cnt: " +
                                  this._timing.full_fbu_cnt + ", avg: " +
                                  (this._timing.full_fbu_total / this._timing.full_fbu_cnt));
                    }

                    if (this._timing.fbu_rt_start > 0) {
                        var fbu_rt_diff = now - this._timing.fbu_rt_start;
                        this._timing.fbu_rt_total += fbu_rt_diff;
                        this._timing.fbu_rt_cnt++;
                        Util.Info("full FBU round-trip, cur: " +
                                  fbu_rt_diff + ", total: " +
                                  this._timing.fbu_rt_total + ", cnt: " +
                                  this._timing.fbu_rt_cnt + ", avg: " +
                                  (this._timing.fbu_rt_total / this._timing.fbu_rt_cnt));
                        this._timing.fbu_rt_start = 0;
                    }
                }

                if (!ret) { return ret; }  // need more data
            }

            this._onFBUComplete(this,
                    {'x': this._FBU.x, 'y': this._FBU.y,
                     'width': this._FBU.width, 'height': this._FBU.height,
                     'encoding': this._FBU.encoding,
                     'encodingName': this._encNames[this._FBU.encoding]});

            return true;  // We finished this FBU
        },
    };

    Util.make_properties(RFB, [
        ['target', 'wo', 'dom'],                // VNC display rendering Canvas object
        ['focusContainer', 'wo', 'dom'],        // DOM element that captures keyboard input
        ['encrypt', 'rw', 'bool'],              // Use TLS/SSL/wss encryption
        ['true_color', 'rw', 'bool'],           // Request true color pixel data
        ['local_cursor', 'rw', 'bool'],         // Request locally rendered cursor
        ['shared', 'rw', 'bool'],               // Request shared mode
        ['view_only', 'rw', 'bool'],            // Disable client mouse/keyboard
        ['xvp_password_sep', 'rw', 'str'],      // Separator for XVP password fields
        ['disconnectTimeout', 'rw', 'int'],     // Time (s) to wait for disconnection
        ['wsProtocols', 'rw', 'arr'],           // Protocols to use in the WebSocket connection
        ['repeaterID', 'rw', 'str'],            // [UltraVNC] RepeaterID to connect to
        ['viewportDrag', 'rw', 'bool'],         // Move the viewport on mouse drags

        // Callback functions
        ['onUpdateState', 'rw', 'func'],        // onUpdateState(rfb, state, oldstate, statusMsg): RFB state update/change
        ['onPasswordRequired', 'rw', 'func'],   // onPasswordRequired(rfb): VNC password is required
        ['onClipboard', 'rw', 'func'],          // onClipboard(rfb, text): RFB clipboard contents received
        ['onBell', 'rw', 'func'],               // onBell(rfb): RFB Bell message received
        ['onFBUReceive', 'rw', 'func'],         // onFBUReceive(rfb, fbu): RFB FBU received but not yet processed
        ['onFBUComplete', 'rw', 'func'],        // onFBUComplete(rfb, fbu): RFB FBU received and processed
        ['onFBResize', 'rw', 'func'],           // onFBResize(rfb, width, height): frame buffer resized
        ['onDesktopName', 'rw', 'func'],        // onDesktopName(rfb, name): desktop name received
        ['onXvpInit', 'rw', 'func'],            // onXvpInit(version): XVP extensions active for this connection
    ]);

    RFB.prototype.set_local_cursor = function (cursor) {
        if (!cursor || (cursor in {'0': 1, 'no': 1, 'false': 1})) {
            this._local_cursor = false;
        } else {
            if (this._display.get_cursor_uri()) {
                this._local_cursor = true;
            } else {
                Util.Warn("Browser does not support local cursor");
            }
        }
    };

    RFB.prototype.get_display = function () { return this._display; };
    RFB.prototype.get_keyboard = function () { return this._keyboard; };
    RFB.prototype.get_mouse = function () { return this._mouse; };

    // Class Methods
    RFB.messages = {
        keyEvent: function (keysym, down) {
            var arr = [4];
            arr.push8(down);
            arr.push16(0);
            arr.push32(keysym);
            return arr;
        },

        pointerEvent: function (x, y, mask) {
            var arr = [5];  // msg-type
            arr.push8(mask);
            arr.push16(x);
            arr.push16(y);
            return arr;
        },

        // TODO(directxman12): make this unicode compatible?
        clientCutText: function (text) {
            var arr = [6];  // msg-type
            arr.push8(0);   // padding
            arr.push8(0);   // padding
            arr.push8(0);   // padding
            arr.push32(text.length);
            var n = text.length;
            for (var i = 0; i < n; i++) {
                arr.push(text.charCodeAt(i));
            }

            return arr;
        },

        pixelFormat: function (bpp, depth, true_color) {
            var arr = [0]; // msg-type
            arr.push8(0);  // padding
            arr.push8(0);  // padding
            arr.push8(0);  // padding

            arr.push8(bpp * 8); // bits-per-pixel
            arr.push8(depth * 8); // depth
            arr.push8(0);  // little-endian
            arr.push8(true_color ? 1 : 0);  // true-color

            arr.push16(255);  // red-max
            arr.push16(255);  // green-max
            arr.push16(255);  // blue-max
            arr.push8(16);    // red-shift
            arr.push8(8);     // green-shift
            arr.push8(0);     // blue-shift

            arr.push8(0);     // padding
            arr.push8(0);     // padding
            arr.push8(0);     // padding
            return arr;
        },

        clientEncodings: function (encodings, local_cursor, true_color) {
            var i, encList = [];

            for (i = 0; i < encodings.length; i++) {
                if (encodings[i][0] === "Cursor" && !local_cursor) {
                    Util.Debug("Skipping Cursor pseudo-encoding");
                } else if (encodings[i][0] === "TIGHT" && !true_color) {
                    // TODO: remove this when we have tight+non-true-color
                    Util.Warn("Skipping tight as it is only supported with true color");
                } else {
                    encList.push(encodings[i][1]);
                }
            }

            var arr = [2];  // msg-type
            arr.push8(0);   // padding

            arr.push16(encList.length);  // encoding count
            for (i = 0; i < encList.length; i++) {
                arr.push32(encList[i]);
            }

            return arr;
        },

        fbUpdateRequests: function (cleanDirty, fb_width, fb_height) {
            var arr = [];

            var cb = cleanDirty.cleanBox;
            var w, h;
            if (cb.w > 0 && cb.h > 0) {
                w = typeof cb.w === "undefined" ? fb_width : cb.w;
                h = typeof cb.h === "undefined" ? fb_height : cb.h;
                // Request incremental for clean box
                arr = arr.concat(RFB.messages.fbUpdateRequest(1, cb.x, cb.y, w, h));
            }

            for (var i = 0; i < cleanDirty.dirtyBoxes.length; i++) {
                var db = cleanDirty.dirtyBoxes[i];
                // Force all (non-incremental) for dirty box
                w = typeof db.w === "undefined" ? fb_width : db.w;
                h = typeof db.h === "undefined" ? fb_height : db.h;
                arr = arr.concat(RFB.messages.fbUpdateRequest(0, db.x, db.y, w, h));
            }

            return arr;
        },

        fbUpdateRequest: function (incremental, x, y, w, h) {
            if (typeof(x) === "undefined") { x = 0; }
            if (typeof(y) === "undefined") { y = 0; }

            var arr = [3];  // msg-type
            arr.push8(incremental);
            arr.push16(x);
            arr.push16(y);
            arr.push16(w);
            arr.push16(h);

            return arr;
        }
    };

    RFB.genDES = function (password, challenge) {
        var passwd = [];
        for (var i = 0; i < password.length; i++) {
            passwd.push(password.charCodeAt(i));
        }
        return (new DES(passwd)).encrypt(challenge);
    };

    RFB.extract_data_uri = function (arr) {
        return ";base64," + Base64.encode(arr);
    };

    RFB.encodingHandlers = {
        RAW: function () {
            if (this._FBU.lines === 0) {
                this._FBU.lines = this._FBU.height;
            }

            this._FBU.bytes = this._FBU.width * this._fb_Bpp;  // at least a line
            if (this._sock.rQwait("RAW", this._FBU.bytes)) { return false; }
            var cur_y = this._FBU.y + (this._FBU.height - this._FBU.lines);
            var curr_height = Math.min(this._FBU.lines,
                                       Math.floor(this._sock.rQlen() / (this._FBU.width * this._fb_Bpp)));
            this._display.blitImage(this._FBU.x, cur_y, this._FBU.width,
                                    curr_height, this._sock.get_rQ(),
                                    this._sock.get_rQi());
            this._sock.rQskipBytes(this._FBU.width * curr_height * this._fb_Bpp);
            this._FBU.lines -= curr_height;

            if (this._FBU.lines > 0) {
                this._FBU.bytes = this._FBU.width * this._fb_Bpp;  // At least another line
            } else {
                this._FBU.rects--;
                this._FBU.bytes = 0;
            }

            return true;
        },

        COPYRECT: function () {
            this._FBU.bytes = 4;
            if (this._sock.rQwait("COPYRECT", 4)) { return false; }
            this._display.renderQ_push({
                'type': 'copy',
                'old_x': this._sock.rQshift16(),
                'old_y': this._sock.rQshift16(),
                'x': this._FBU.x,
                'y': this._FBU.y,
                'width': this._FBU.width,
                'height': this._FBU.height
            });
            this._FBU.rects--;
            this._FBU.bytes = 0;
            return true;
        },

        RRE: function () {
            var color;
            if (this._FBU.subrects === 0) {
                this._FBU.bytes = 4 + this._fb_Bpp;
                if (this._sock.rQwait("RRE", 4 + this._fb_Bpp)) { return false; }
                this._FBU.subrects = this._sock.rQshift32();
                color = this._sock.rQshiftBytes(this._fb_Bpp);  // Background
                this._display.fillRect(this._FBU.x, this._FBU.y, this._FBU.width, this._FBU.height, color);
            }

            while (this._FBU.subrects > 0 && this._sock.rQlen() >= (this._fb_Bpp + 8)) {
                color = this._sock.rQshiftBytes(this._fb_Bpp);
                var x = this._sock.rQshift16();
                var y = this._sock.rQshift16();
                var width = this._sock.rQshift16();
                var height = this._sock.rQshift16();
                this._display.fillRect(this._FBU.x + x, this._FBU.y + y, width, height, color);
                this._FBU.subrects--;
            }

            if (this._FBU.subrects > 0) {
                var chunk = Math.min(this._rre_chunk_sz, this._FBU.subrects);
                this._FBU.bytes = (this._fb_Bpp + 8) * chunk;
            } else {
                this._FBU.rects--;
                this._FBU.bytes = 0;
            }

            return true;
        },

        HEXTILE: function () {
            var rQ = this._sock.get_rQ();
            var rQi = this._sock.get_rQi();

            if (this._FBU.tiles === 0) {
                this._FBU.tiles_x = Math.ceil(this._FBU.width / 16);
                this._FBU.tiles_y = Math.ceil(this._FBU.height / 16);
                this._FBU.total_tiles = this._FBU.tiles_x * this._FBU.tiles_y;
                this._FBU.tiles = this._FBU.total_tiles;
            }

            while (this._FBU.tiles > 0) {
                this._FBU.bytes = 1;
                if (this._sock.rQwait("HEXTILE subencoding", this._FBU.bytes)) { return false; }
                var subencoding = rQ[rQi];  // Peek
                if (subencoding > 30) {  // Raw
                    this._fail("Disconnected: illegal hextile subencoding " + subencoding);
                    return false;
                }

                var subrects = 0;
                var curr_tile = this._FBU.total_tiles - this._FBU.tiles;
                var tile_x = curr_tile % this._FBU.tiles_x;
                var tile_y = Math.floor(curr_tile / this._FBU.tiles_x);
                var x = this._FBU.x + tile_x * 16;
                var y = this._FBU.y + tile_y * 16;
                var w = Math.min(16, (this._FBU.x + this._FBU.width) - x);
                var h = Math.min(16, (this._FBU.y + this._FBU.height) - y);

                // Figure out how much we are expecting
                if (subencoding & 0x01) {  // Raw
                    this._FBU.bytes += w * h * this._fb_Bpp;
                } else {
                    if (subencoding & 0x02) {  // Background
                        this._FBU.bytes += this._fb_Bpp;
                    }
                    if (subencoding & 0x04) {  // Foreground
                        this._FBU.bytes += this._fb_Bpp;
                    }
                    if (subencoding & 0x08) {  // AnySubrects
                        this._FBU.bytes++;  // Since we aren't shifting it off
                        if (this._sock.rQwait("hextile subrects header", this._FBU.bytes)) { return false; }
                        subrects = rQ[rQi + this._FBU.bytes - 1];  // Peek
                        if (subencoding & 0x10) {  // SubrectsColoured
                            this._FBU.bytes += subrects * (this._fb_Bpp + 2);
                        } else {
                            this._FBU.bytes += subrects * 2;
                        }
                    }
                }

                if (this._sock.rQwait("hextile", this._FBU.bytes)) { return false; }

                // We know the encoding and have a whole tile
                this._FBU.subencoding = rQ[rQi];
                rQi++;
                if (this._FBU.subencoding === 0) {
                    if (this._FBU.lastsubencoding & 0x01) {
                        // Weird: ignore blanks are RAW
                        Util.Debug("     Ignoring blank after RAW");
                    } else {
                        this._display.fillRect(x, y, w, h, this._FBU.background);
                    }
                } else if (this._FBU.subencoding & 0x01) {  // Raw
                    this._display.blitImage(x, y, w, h, rQ, rQi);
                    rQi += this._FBU.bytes - 1;
                } else {
                    if (this._FBU.subencoding & 0x02) {  // Background
                        this._FBU.background = rQ.slice(rQi, rQi + this._fb_Bpp);
                        rQi += this._fb_Bpp;
                    }
                    if (this._FBU.subencoding & 0x04) {  // Foreground
                        this._FBU.foreground = rQ.slice(rQi, rQi + this._fb_Bpp);
                        rQi += this._fb_Bpp;
                    }

                    this._display.startTile(x, y, w, h, this._FBU.background);
                    if (this._FBU.subencoding & 0x08) {  // AnySubrects
                        subrects = rQ[rQi];
                        rQi++;

                        for (var s = 0; s < subrects; s++) {
                            var color;
                            if (this._FBU.subencoding & 0x10) {  // SubrectsColoured
                                color = rQ.slice(rQi, rQi + this._fb_Bpp);
                                rQi += this._fb_Bpp;
                            } else {
                                color = this._FBU.foreground;
                            }
                            var xy = rQ[rQi];
                            rQi++;
                            var sx = (xy >> 4);
                            var sy = (xy & 0x0f);

                            var wh = rQ[rQi];
                            rQi++;
                            var sw = (wh >> 4) + 1;
                            var sh = (wh & 0x0f) + 1;

                            this._display.subTile(sx, sy, sw, sh, color);
                        }
                    }
                    this._display.finishTile();
                }
                this._sock.set_rQi(rQi);
                this._FBU.lastsubencoding = this._FBU.subencoding;
                this._FBU.bytes = 0;
                this._FBU.tiles--;
            }

            if (this._FBU.tiles === 0) {
                this._FBU.rects--;
            }

            return true;
        },

        getTightCLength: function (arr) {
            var header = 1, data = 0;
            data += arr[0] & 0x7f;
            if (arr[0] & 0x80) {
                header++;
                data += (arr[1] & 0x7f) << 7;
                if (arr[1] & 0x80) {
                    header++;
                    data += arr[2] << 14;
                }
            }
            return [header, data];
        },

        display_tight: function (isTightPNG) {
            if (this._fb_depth === 1) {
                this._fail("Tight protocol handler only implements true color mode");
            }

            this._FBU.bytes = 1;  // compression-control byte
            if (this._sock.rQwait("TIGHT compression-control", this._FBU.bytes)) { return false; }

            var checksum = function (data) {
                var sum = 0;
                for (var i = 0; i < data.length; i++) {
                    sum += data[i];
                    if (sum > 65536) sum -= 65536;
                }
                return sum;
            };

            var resetStreams = 0;
            var streamId = -1;
            var decompress = function (data) {
                for (var i = 0; i < 4; i++) {
                    if ((resetStreams >> i) & 1) {
                        this._FBU.zlibs[i].reset();
                        Util.Info("Reset zlib stream " + i);
                    }
                }

                var uncompressed = this._FBU.zlibs[streamId].uncompress(data, 0);
                if (uncompressed.status !== 0) {
                    Util.Error("Invalid data in zlib stream");
                }

                return uncompressed.data;
            }.bind(this);

            var indexedToRGB = function (data, numColors, palette, width, height) {
                // Convert indexed (palette based) image data to RGB
                // TODO: reduce number of calculations inside loop
                var dest = [];
                var x, y, dp, sp;
                if (numColors === 2) {
                    var w = Math.floor((width + 7) / 8);
                    var w1 = Math.floor(width / 8);

                    for (y = 0; y < height; y++) {
                        var b;
                        for (x = 0; x < w1; x++) {
                            for (b = 7; b >= 0; b--) {
                                dp = (y * width + x * 8 + 7 - b) * 3;
                                sp = (data[y * w + x] >> b & 1) * 3;
                                dest[dp] = palette[sp];
                                dest[dp + 1] = palette[sp + 1];
                                dest[dp + 2] = palette[sp + 2];
                            }
                        }

                        for (b = 7; b >= 8 - width % 8; b--) {
                            dp = (y * width + x * 8 + 7 - b) * 3;
                            sp = (data[y * w + x] >> b & 1) * 3;
                            dest[dp] = palette[sp];
                            dest[dp + 1] = palette[sp + 1];
                            dest[dp + 2] = palette[sp + 2];
                        }
                    }
                } else {
                    for (y = 0; y < height; y++) {
                        for (x = 0; x < width; x++) {
                            dp = (y * width + x) * 3;
                            sp = data[y * width + x] * 3;
                            dest[dp] = palette[sp];
                            dest[dp + 1] = palette[sp + 1];
                            dest[dp + 2] = palette[sp + 2];
                        }
                    }
                }

                return dest;
            }.bind(this);

            var rQ = this._sock.get_rQ();
            var rQi = this._sock.get_rQi();
            var cmode, clength, data;

            var handlePalette = function () {
                var numColors = rQ[rQi + 2] + 1;
                var paletteSize = numColors * this._fb_depth;
                this._FBU.bytes += paletteSize;
                if (this._sock.rQwait("TIGHT palette " + cmode, this._FBU.bytes)) { return false; }

                var bpp = (numColors <= 2) ? 1 : 8;
                var rowSize = Math.floor((this._FBU.width * bpp + 7) / 8);
                var raw = false;
                if (rowSize * this._FBU.height < 12) {
                    raw = true;
                    clength = [0, rowSize * this._FBU.height];
                } else {
                    clength = RFB.encodingHandlers.getTightCLength(this._sock.rQslice(3 + paletteSize,
                                                                                      3 + paletteSize + 3));
                }

                this._FBU.bytes += clength[0] + clength[1];
                if (this._sock.rQwait("TIGHT " + cmode, this._FBU.bytes)) { return false; }

                // Shift ctl, filter id, num colors, palette entries, and clength off
                this._sock.rQskipBytes(3);
                var palette = this._sock.rQshiftBytes(paletteSize);
                this._sock.rQskipBytes(clength[0]);

                if (raw) {
                    data = this._sock.rQshiftBytes(clength[1]);
                } else {
                    data = decompress(this._sock.rQshiftBytes(clength[1]));
                }

                // Convert indexed (palette based) image data to RGB
                var rgb = indexedToRGB(data, numColors, palette, this._FBU.width, this._FBU.height);

                this._display.renderQ_push({
                    'type': 'blitRgb',
                    'data': rgb,
                    'x': this._FBU.x,
                    'y': this._FBU.y,
                    'width': this._FBU.width,
                    'height': this._FBU.height
                });

                return true;
            }.bind(this);

            var handleCopy = function () {
                var raw = false;
                var uncompressedSize = this._FBU.width * this._FBU.height * this._fb_depth;
                if (uncompressedSize < 12) {
                    raw = true;
                    clength = [0, uncompressedSize];
                } else {
                    clength = RFB.encodingHandlers.getTightCLength(this._sock.rQslice(1, 4));
                }
                this._FBU.bytes = 1 + clength[0] + clength[1];
                if (this._sock.rQwait("TIGHT " + cmode, this._FBU.bytes)) { return false; }

                // Shift ctl, clength off
                this._sock.rQshiftBytes(1 + clength[0]);

                if (raw) {
                    data = this._sock.rQshiftBytes(clength[1]);
                } else {
                    data = decompress(this._sock.rQshiftBytes(clength[1]));
                }

                this._display.renderQ_push({
                    'type': 'blitRgb',
                    'data': data,
                    'x': this._FBU.x,
                    'y': this._FBU.y,
                    'width': this._FBU.width,
                    'height': this._FBU.height
                });

                return true;
            }.bind(this);

            var ctl = this._sock.rQpeek8();

            // Keep tight reset bits
            resetStreams = ctl & 0xF;

            // Figure out filter
            ctl = ctl >> 4;
            streamId = ctl & 0x3;

            if (ctl === 0x08)       cmode = "fill";
            else if (ctl === 0x09)  cmode = "jpeg";
            else if (ctl === 0x0A)  cmode = "png";
            else if (ctl & 0x04)    cmode = "filter";
            else if (ctl < 0x04)    cmode = "copy";
            else return this._fail("Illegal tight compression received, ctl: " + ctl);

            if (isTightPNG && (cmode === "filter" || cmode === "copy")) {
                return this._fail("filter/copy received in tightPNG mode");
            }

            switch (cmode) {
                // fill use fb_depth because TPIXELs drop the padding byte
                case "fill":  // TPIXEL
                    this._FBU.bytes += this._fb_depth;
                    break;
                case "jpeg":  // max clength
                    this._FBU.bytes += 3;
                    break;
                case "png":  // max clength
                    this._FBU.bytes += 3;
                    break;
                case "filter":  // filter id + num colors if palette
                    this._FBU.bytes += 2;
                    break;
                case "copy":
                    break;
            }

            if (this._sock.rQwait("TIGHT " + cmode, this._FBU.bytes)) { return false; }

            // Determine FBU.bytes
            switch (cmode) {
                case "fill":
                    this._sock.rQskip8();  // shift off ctl
                    var color = this._sock.rQshiftBytes(this._fb_depth);
                    this._display.renderQ_push({
                        'type': 'fill',
                        'x': this._FBU.x,
                        'y': this._FBU.y,
                        'width': this._FBU.width,
                        'height': this._FBU.height,
                        'color': [color[2], color[1], color[0]]
                    });
                    break;
                case "png":
                case "jpeg":
                    clength = RFB.encodingHandlers.getTightCLength(this._sock.rQslice(1, 4));
                    this._FBU.bytes = 1 + clength[0] + clength[1];  // ctl + clength size + jpeg-data
                    if (this._sock.rQwait("TIGHT " + cmode, this._FBU.bytes)) { return false; }

                    // We have everything, render it
                    this._sock.rQskipBytes(1 + clength[0]);  // shift off clt + compact length
                    var img = new Image();
                    img.src = "data: image/" + cmode +
                        RFB.extract_data_uri(this._sock.rQshiftBytes(clength[1]));
                    this._display.renderQ_push({
                        'type': 'img',
                        'img': img,
                        'x': this._FBU.x,
                        'y': this._FBU.y
                    });
                    img = null;
                    break;
                case "filter":
                    var filterId = rQ[rQi + 1];
                    if (filterId === 1) {
                        if (!handlePalette()) { return false; }
                    } else {
                        // Filter 0, Copy could be valid here, but servers don't send it as an explicit filter
                        // Filter 2, Gradient is valid but not use if jpeg is enabled
                        // TODO(directxman12): why aren't we just calling '_fail' here
                        throw new Error("Unsupported tight subencoding received, filter: " + filterId);
                    }
                    break;
                case "copy":
                    if (!handleCopy()) { return false; }
                    break;
            }


            this._FBU.bytes = 0;
            this._FBU.rects--;

            return true;
        },

        TIGHT: function () { return this._encHandlers.display_tight(false); },
        TIGHT_PNG: function () { return this._encHandlers.display_tight(true); },

        last_rect: function () {
            this._FBU.rects = 0;
            return true;
        },

        DesktopSize: function () {
            Util.Debug(">> set_desktopsize");
            this._fb_width = this._FBU.width;
            this._fb_height = this._FBU.height;
            this._onFBResize(this, this._fb_width, this._fb_height);
            this._display.resize(this._fb_width, this._fb_height);
            this._timing.fbu_rt_start = (new Date()).getTime();

            this._FBU.bytes = 0;
            this._FBU.rects--;

            Util.Debug("<< set_desktopsize");
            return true;
        },

        Cursor: function () {
            Util.Debug(">> set_cursor");
            var x = this._FBU.x;  // hotspot-x
            var y = this._FBU.y;  // hotspot-y
            var w = this._FBU.width;
            var h = this._FBU.height;

            var pixelslength = w * h * this._fb_Bpp;
            var masklength = Math.floor((w + 7) / 8) * h;

            this._FBU.bytes = pixelslength + masklength;
            if (this._sock.rQwait("cursor encoding", this._FBU.bytes)) { return false; }

            this._display.changeCursor(this._sock.rQshiftBytes(pixelslength),
                                       this._sock.rQshiftBytes(masklength),
                                       x, y, w, h);

            this._FBU.bytes = 0;
            this._FBU.rects--;

            Util.Debug("<< set_cursor");
            return true;
        },

        JPEG_quality_lo: function () {
            Util.Error("Server sent jpeg_quality pseudo-encoding");
        },

        compress_lo: function () {
            Util.Error("Server sent compress level pseudo-encoding");
        }
    };
})();
//End of bower_components/no-vnc/include/rfb.js

// bower_components/no-vnc/include/keysym.js
var XK_VoidSymbol =                0xffffff, /* Void symbol */

XK_BackSpace =                   0xff08, /* Back space, back char */
XK_Tab =                         0xff09,
XK_Linefeed =                    0xff0a, /* Linefeed, LF */
XK_Clear =                       0xff0b,
XK_Return =                      0xff0d, /* Return, enter */
XK_Pause =                       0xff13, /* Pause, hold */
XK_Scroll_Lock =                 0xff14,
XK_Sys_Req =                     0xff15,
XK_Escape =                      0xff1b,
XK_Delete =                      0xffff, /* Delete, rubout */

/* Cursor control & motion */

XK_Home =                        0xff50,
XK_Left =                        0xff51, /* Move left, left arrow */
XK_Up =                          0xff52, /* Move up, up arrow */
XK_Right =                       0xff53, /* Move right, right arrow */
XK_Down =                        0xff54, /* Move down, down arrow */
XK_Prior =                       0xff55, /* Prior, previous */
XK_Page_Up =                     0xff55,
XK_Next =                        0xff56, /* Next */
XK_Page_Down =                   0xff56,
XK_End =                         0xff57, /* EOL */
XK_Begin =                       0xff58, /* BOL */


/* Misc functions */

XK_Select =                      0xff60, /* Select, mark */
XK_Print =                       0xff61,
XK_Execute =                     0xff62, /* Execute, run, do */
XK_Insert =                      0xff63, /* Insert, insert here */
XK_Undo =                        0xff65,
XK_Redo =                        0xff66, /* Redo, again */
XK_Menu =                        0xff67,
XK_Find =                        0xff68, /* Find, search */
XK_Cancel =                      0xff69, /* Cancel, stop, abort, exit */
XK_Help =                        0xff6a, /* Help */
XK_Break =                       0xff6b,
XK_Mode_switch =                 0xff7e, /* Character set switch */
XK_script_switch =               0xff7e, /* Alias for mode_switch */
XK_Num_Lock =                    0xff7f,

/* Keypad functions, keypad numbers cleverly chosen to map to ASCII */

XK_KP_Space =                    0xff80, /* Space */
XK_KP_Tab =                      0xff89,
XK_KP_Enter =                    0xff8d, /* Enter */
XK_KP_F1 =                       0xff91, /* PF1, KP_A, ... */
XK_KP_F2 =                       0xff92,
XK_KP_F3 =                       0xff93,
XK_KP_F4 =                       0xff94,
XK_KP_Home =                     0xff95,
XK_KP_Left =                     0xff96,
XK_KP_Up =                       0xff97,
XK_KP_Right =                    0xff98,
XK_KP_Down =                     0xff99,
XK_KP_Prior =                    0xff9a,
XK_KP_Page_Up =                  0xff9a
XK_KP_Next =                     0xff9b,
XK_KP_Page_Down =                0xff9b,
XK_KP_End =                      0xff9c,
XK_KP_Begin =                    0xff9d,
XK_KP_Insert =                   0xff9e,
XK_KP_Delete =                   0xff9f,
XK_KP_Equal =                    0xffbd, /* Equals */
XK_KP_Multiply =                 0xffaa,
XK_KP_Add =                      0xffab,
XK_KP_Separator =                0xffac, /* Separator, often comma */
XK_KP_Subtract =                 0xffad,
XK_KP_Decimal =                  0xffae,
XK_KP_Divide =                   0xffaf,

XK_KP_0 =                        0xffb0,
XK_KP_1 =                        0xffb1,
XK_KP_2 =                        0xffb2,
XK_KP_3 =                        0xffb3,
XK_KP_4 =                        0xffb4,
XK_KP_5 =                        0xffb5,
XK_KP_6 =                        0xffb6,
XK_KP_7 =                        0xffb7,
XK_KP_8 =                        0xffb8,
XK_KP_9 =                        0xffb9,

/*
 * Auxiliary functions; note the duplicate definitions for left and right
 * function keys;  Sun keyboards and a few other manufacturers have such
 * function key groups on the left and/or right sides of the keyboard.
 * We've not found a keyboard with more than 35 function keys total.
 */

XK_F1 =                          0xffbe,
XK_F2 =                          0xffbf,
XK_F3 =                          0xffc0,
XK_F4 =                          0xffc1,
XK_F5 =                          0xffc2,
XK_F6 =                          0xffc3,
XK_F7 =                          0xffc4,
XK_F8 =                          0xffc5,
XK_F9 =                          0xffc6,
XK_F10 =                         0xffc7,
XK_F11 =                         0xffc8,
XK_L1 =                          0xffc8,
XK_F12 =                         0xffc9,
XK_L2 =                          0xffc9,
XK_F13 =                         0xffca,
XK_L3 =                          0xffca,
XK_F14 =                         0xffcb,
XK_L4 =                          0xffcb,
XK_F15 =                         0xffcc,
XK_L5 =                          0xffcc,
XK_F16 =                         0xffcd,
XK_L6 =                          0xffcd,
XK_F17 =                         0xffce,
XK_L7 =                          0xffce,
XK_F18 =                         0xffcf,
XK_L8 =                          0xffcf,
XK_F19 =                         0xffd0,
XK_L9 =                          0xffd0,
XK_F20 =                         0xffd1,
XK_L10 =                         0xffd1,
XK_F21 =                         0xffd2,
XK_R1 =                          0xffd2,
XK_F22 =                         0xffd3,
XK_R2 =                          0xffd3,
XK_F23 =                         0xffd4,
XK_R3 =                          0xffd4,
XK_F24 =                         0xffd5,
XK_R4 =                          0xffd5,
XK_F25 =                         0xffd6,
XK_R5 =                          0xffd6,
XK_F26 =                         0xffd7,
XK_R6 =                          0xffd7,
XK_F27 =                         0xffd8,
XK_R7 =                          0xffd8,
XK_F28 =                         0xffd9,
XK_R8 =                          0xffd9,
XK_F29 =                         0xffda,
XK_R9 =                          0xffda,
XK_F30 =                         0xffdb,
XK_R10 =                         0xffdb,
XK_F31 =                         0xffdc,
XK_R11 =                         0xffdc,
XK_F32 =                         0xffdd,
XK_R12 =                         0xffdd,
XK_F33 =                         0xffde,
XK_R13 =                         0xffde,
XK_F34 =                         0xffdf,
XK_R14 =                         0xffdf,
XK_F35 =                         0xffe0,
XK_R15 =                         0xffe0,

/* Modifiers */

XK_Shift_L =                     0xffe1, /* Left shift */
XK_Shift_R =                     0xffe2, /* Right shift */
XK_Control_L =                   0xffe3, /* Left control */
XK_Control_R =                   0xffe4, /* Right control */
XK_Caps_Lock =                   0xffe5, /* Caps lock */
XK_Shift_Lock =                  0xffe6, /* Shift lock */

XK_Meta_L =                      0xffe7, /* Left meta */
XK_Meta_R =                      0xffe8, /* Right meta */
XK_Alt_L =                       0xffe9, /* Left alt */
XK_Alt_R =                       0xffea, /* Right alt */
XK_Super_L =                     0xffeb, /* Left super */
XK_Super_R =                     0xffec, /* Right super */
XK_Hyper_L =                     0xffed, /* Left hyper */
XK_Hyper_R =                     0xffee, /* Right hyper */

XK_ISO_Level3_Shift =            0xfe03, /* AltGr */

/*
 * Latin 1
 * (ISO/IEC 8859-1 = Unicode U+0020..U+00FF)
 * Byte 3 = 0
 */

XK_space =                       0x0020, /* U+0020 SPACE */
XK_exclam =                      0x0021, /* U+0021 EXCLAMATION MARK */
XK_quotedbl =                    0x0022, /* U+0022 QUOTATION MARK */
XK_numbersign =                  0x0023, /* U+0023 NUMBER SIGN */
XK_dollar =                      0x0024, /* U+0024 DOLLAR SIGN */
XK_percent =                     0x0025, /* U+0025 PERCENT SIGN */
XK_ampersand =                   0x0026, /* U+0026 AMPERSAND */
XK_apostrophe =                  0x0027, /* U+0027 APOSTROPHE */
XK_quoteright =                  0x0027, /* deprecated */
XK_parenleft =                   0x0028, /* U+0028 LEFT PARENTHESIS */
XK_parenright =                  0x0029, /* U+0029 RIGHT PARENTHESIS */
XK_asterisk =                    0x002a, /* U+002A ASTERISK */
XK_plus =                        0x002b, /* U+002B PLUS SIGN */
XK_comma =                       0x002c, /* U+002C COMMA */
XK_minus =                       0x002d, /* U+002D HYPHEN-MINUS */
XK_period =                      0x002e, /* U+002E FULL STOP */
XK_slash =                       0x002f, /* U+002F SOLIDUS */
XK_0 =                           0x0030, /* U+0030 DIGIT ZERO */
XK_1 =                           0x0031, /* U+0031 DIGIT ONE */
XK_2 =                           0x0032, /* U+0032 DIGIT TWO */
XK_3 =                           0x0033, /* U+0033 DIGIT THREE */
XK_4 =                           0x0034, /* U+0034 DIGIT FOUR */
XK_5 =                           0x0035, /* U+0035 DIGIT FIVE */
XK_6 =                           0x0036, /* U+0036 DIGIT SIX */
XK_7 =                           0x0037, /* U+0037 DIGIT SEVEN */
XK_8 =                           0x0038, /* U+0038 DIGIT EIGHT */
XK_9 =                           0x0039, /* U+0039 DIGIT NINE */
XK_colon =                       0x003a, /* U+003A COLON */
XK_semicolon =                   0x003b, /* U+003B SEMICOLON */
XK_less =                        0x003c, /* U+003C LESS-THAN SIGN */
XK_equal =                       0x003d, /* U+003D EQUALS SIGN */
XK_greater =                     0x003e, /* U+003E GREATER-THAN SIGN */
XK_question =                    0x003f, /* U+003F QUESTION MARK */
XK_at =                          0x0040, /* U+0040 COMMERCIAL AT */
XK_A =                           0x0041, /* U+0041 LATIN CAPITAL LETTER A */
XK_B =                           0x0042, /* U+0042 LATIN CAPITAL LETTER B */
XK_C =                           0x0043, /* U+0043 LATIN CAPITAL LETTER C */
XK_D =                           0x0044, /* U+0044 LATIN CAPITAL LETTER D */
XK_E =                           0x0045, /* U+0045 LATIN CAPITAL LETTER E */
XK_F =                           0x0046, /* U+0046 LATIN CAPITAL LETTER F */
XK_G =                           0x0047, /* U+0047 LATIN CAPITAL LETTER G */
XK_H =                           0x0048, /* U+0048 LATIN CAPITAL LETTER H */
XK_I =                           0x0049, /* U+0049 LATIN CAPITAL LETTER I */
XK_J =                           0x004a, /* U+004A LATIN CAPITAL LETTER J */
XK_K =                           0x004b, /* U+004B LATIN CAPITAL LETTER K */
XK_L =                           0x004c, /* U+004C LATIN CAPITAL LETTER L */
XK_M =                           0x004d, /* U+004D LATIN CAPITAL LETTER M */
XK_N =                           0x004e, /* U+004E LATIN CAPITAL LETTER N */
XK_O =                           0x004f, /* U+004F LATIN CAPITAL LETTER O */
XK_P =                           0x0050, /* U+0050 LATIN CAPITAL LETTER P */
XK_Q =                           0x0051, /* U+0051 LATIN CAPITAL LETTER Q */
XK_R =                           0x0052, /* U+0052 LATIN CAPITAL LETTER R */
XK_S =                           0x0053, /* U+0053 LATIN CAPITAL LETTER S */
XK_T =                           0x0054, /* U+0054 LATIN CAPITAL LETTER T */
XK_U =                           0x0055, /* U+0055 LATIN CAPITAL LETTER U */
XK_V =                           0x0056, /* U+0056 LATIN CAPITAL LETTER V */
XK_W =                           0x0057, /* U+0057 LATIN CAPITAL LETTER W */
XK_X =                           0x0058, /* U+0058 LATIN CAPITAL LETTER X */
XK_Y =                           0x0059, /* U+0059 LATIN CAPITAL LETTER Y */
XK_Z =                           0x005a, /* U+005A LATIN CAPITAL LETTER Z */
XK_bracketleft =                 0x005b, /* U+005B LEFT SQUARE BRACKET */
XK_backslash =                   0x005c, /* U+005C REVERSE SOLIDUS */
XK_bracketright =                0x005d, /* U+005D RIGHT SQUARE BRACKET */
XK_asciicircum =                 0x005e, /* U+005E CIRCUMFLEX ACCENT */
XK_underscore =                  0x005f, /* U+005F LOW LINE */
XK_grave =                       0x0060, /* U+0060 GRAVE ACCENT */
XK_quoteleft =                   0x0060, /* deprecated */
XK_a =                           0x0061, /* U+0061 LATIN SMALL LETTER A */
XK_b =                           0x0062, /* U+0062 LATIN SMALL LETTER B */
XK_c =                           0x0063, /* U+0063 LATIN SMALL LETTER C */
XK_d =                           0x0064, /* U+0064 LATIN SMALL LETTER D */
XK_e =                           0x0065, /* U+0065 LATIN SMALL LETTER E */
XK_f =                           0x0066, /* U+0066 LATIN SMALL LETTER F */
XK_g =                           0x0067, /* U+0067 LATIN SMALL LETTER G */
XK_h =                           0x0068, /* U+0068 LATIN SMALL LETTER H */
XK_i =                           0x0069, /* U+0069 LATIN SMALL LETTER I */
XK_j =                           0x006a, /* U+006A LATIN SMALL LETTER J */
XK_k =                           0x006b, /* U+006B LATIN SMALL LETTER K */
XK_l =                           0x006c, /* U+006C LATIN SMALL LETTER L */
XK_m =                           0x006d, /* U+006D LATIN SMALL LETTER M */
XK_n =                           0x006e, /* U+006E LATIN SMALL LETTER N */
XK_o =                           0x006f, /* U+006F LATIN SMALL LETTER O */
XK_p =                           0x0070, /* U+0070 LATIN SMALL LETTER P */
XK_q =                           0x0071, /* U+0071 LATIN SMALL LETTER Q */
XK_r =                           0x0072, /* U+0072 LATIN SMALL LETTER R */
XK_s =                           0x0073, /* U+0073 LATIN SMALL LETTER S */
XK_t =                           0x0074, /* U+0074 LATIN SMALL LETTER T */
XK_u =                           0x0075, /* U+0075 LATIN SMALL LETTER U */
XK_v =                           0x0076, /* U+0076 LATIN SMALL LETTER V */
XK_w =                           0x0077, /* U+0077 LATIN SMALL LETTER W */
XK_x =                           0x0078, /* U+0078 LATIN SMALL LETTER X */
XK_y =                           0x0079, /* U+0079 LATIN SMALL LETTER Y */
XK_z =                           0x007a, /* U+007A LATIN SMALL LETTER Z */
XK_braceleft =                   0x007b, /* U+007B LEFT CURLY BRACKET */
XK_bar =                         0x007c, /* U+007C VERTICAL LINE */
XK_braceright =                  0x007d, /* U+007D RIGHT CURLY BRACKET */
XK_asciitilde =                  0x007e, /* U+007E TILDE */

XK_nobreakspace =                0x00a0, /* U+00A0 NO-BREAK SPACE */
XK_exclamdown =                  0x00a1, /* U+00A1 INVERTED EXCLAMATION MARK */
XK_cent =                        0x00a2, /* U+00A2 CENT SIGN */
XK_sterling =                    0x00a3, /* U+00A3 POUND SIGN */
XK_currency =                    0x00a4, /* U+00A4 CURRENCY SIGN */
XK_yen =                         0x00a5, /* U+00A5 YEN SIGN */
XK_brokenbar =                   0x00a6, /* U+00A6 BROKEN BAR */
XK_section =                     0x00a7, /* U+00A7 SECTION SIGN */
XK_diaeresis =                   0x00a8, /* U+00A8 DIAERESIS */
XK_copyright =                   0x00a9, /* U+00A9 COPYRIGHT SIGN */
XK_ordfeminine =                 0x00aa, /* U+00AA FEMININE ORDINAL INDICATOR */
XK_guillemotleft =               0x00ab, /* U+00AB LEFT-POINTING DOUBLE ANGLE QUOTATION MARK */
XK_notsign =                     0x00ac, /* U+00AC NOT SIGN */
XK_hyphen =                      0x00ad, /* U+00AD SOFT HYPHEN */
XK_registered =                  0x00ae, /* U+00AE REGISTERED SIGN */
XK_macron =                      0x00af, /* U+00AF MACRON */
XK_degree =                      0x00b0, /* U+00B0 DEGREE SIGN */
XK_plusminus =                   0x00b1, /* U+00B1 PLUS-MINUS SIGN */
XK_twosuperior =                 0x00b2, /* U+00B2 SUPERSCRIPT TWO */
XK_threesuperior =               0x00b3, /* U+00B3 SUPERSCRIPT THREE */
XK_acute =                       0x00b4, /* U+00B4 ACUTE ACCENT */
XK_mu =                          0x00b5, /* U+00B5 MICRO SIGN */
XK_paragraph =                   0x00b6, /* U+00B6 PILCROW SIGN */
XK_periodcentered =              0x00b7, /* U+00B7 MIDDLE DOT */
XK_cedilla =                     0x00b8, /* U+00B8 CEDILLA */
XK_onesuperior =                 0x00b9, /* U+00B9 SUPERSCRIPT ONE */
XK_masculine =                   0x00ba, /* U+00BA MASCULINE ORDINAL INDICATOR */
XK_guillemotright =              0x00bb, /* U+00BB RIGHT-POINTING DOUBLE ANGLE QUOTATION MARK */
XK_onequarter =                  0x00bc, /* U+00BC VULGAR FRACTION ONE QUARTER */
XK_onehalf =                     0x00bd, /* U+00BD VULGAR FRACTION ONE HALF */
XK_threequarters =               0x00be, /* U+00BE VULGAR FRACTION THREE QUARTERS */
XK_questiondown =                0x00bf, /* U+00BF INVERTED QUESTION MARK */
XK_Agrave =                      0x00c0, /* U+00C0 LATIN CAPITAL LETTER A WITH GRAVE */
XK_Aacute =                      0x00c1, /* U+00C1 LATIN CAPITAL LETTER A WITH ACUTE */
XK_Acircumflex =                 0x00c2, /* U+00C2 LATIN CAPITAL LETTER A WITH CIRCUMFLEX */
XK_Atilde =                      0x00c3, /* U+00C3 LATIN CAPITAL LETTER A WITH TILDE */
XK_Adiaeresis =                  0x00c4, /* U+00C4 LATIN CAPITAL LETTER A WITH DIAERESIS */
XK_Aring =                       0x00c5, /* U+00C5 LATIN CAPITAL LETTER A WITH RING ABOVE */
XK_AE =                          0x00c6, /* U+00C6 LATIN CAPITAL LETTER AE */
XK_Ccedilla =                    0x00c7, /* U+00C7 LATIN CAPITAL LETTER C WITH CEDILLA */
XK_Egrave =                      0x00c8, /* U+00C8 LATIN CAPITAL LETTER E WITH GRAVE */
XK_Eacute =                      0x00c9, /* U+00C9 LATIN CAPITAL LETTER E WITH ACUTE */
XK_Ecircumflex =                 0x00ca, /* U+00CA LATIN CAPITAL LETTER E WITH CIRCUMFLEX */
XK_Ediaeresis =                  0x00cb, /* U+00CB LATIN CAPITAL LETTER E WITH DIAERESIS */
XK_Igrave =                      0x00cc, /* U+00CC LATIN CAPITAL LETTER I WITH GRAVE */
XK_Iacute =                      0x00cd, /* U+00CD LATIN CAPITAL LETTER I WITH ACUTE */
XK_Icircumflex =                 0x00ce, /* U+00CE LATIN CAPITAL LETTER I WITH CIRCUMFLEX */
XK_Idiaeresis =                  0x00cf, /* U+00CF LATIN CAPITAL LETTER I WITH DIAERESIS */
XK_ETH =                         0x00d0, /* U+00D0 LATIN CAPITAL LETTER ETH */
XK_Eth =                         0x00d0, /* deprecated */
XK_Ntilde =                      0x00d1, /* U+00D1 LATIN CAPITAL LETTER N WITH TILDE */
XK_Ograve =                      0x00d2, /* U+00D2 LATIN CAPITAL LETTER O WITH GRAVE */
XK_Oacute =                      0x00d3, /* U+00D3 LATIN CAPITAL LETTER O WITH ACUTE */
XK_Ocircumflex =                 0x00d4, /* U+00D4 LATIN CAPITAL LETTER O WITH CIRCUMFLEX */
XK_Otilde =                      0x00d5, /* U+00D5 LATIN CAPITAL LETTER O WITH TILDE */
XK_Odiaeresis =                  0x00d6, /* U+00D6 LATIN CAPITAL LETTER O WITH DIAERESIS */
XK_multiply =                    0x00d7, /* U+00D7 MULTIPLICATION SIGN */
XK_Oslash =                      0x00d8, /* U+00D8 LATIN CAPITAL LETTER O WITH STROKE */
XK_Ooblique =                    0x00d8, /* U+00D8 LATIN CAPITAL LETTER O WITH STROKE */
XK_Ugrave =                      0x00d9, /* U+00D9 LATIN CAPITAL LETTER U WITH GRAVE */
XK_Uacute =                      0x00da, /* U+00DA LATIN CAPITAL LETTER U WITH ACUTE */
XK_Ucircumflex =                 0x00db, /* U+00DB LATIN CAPITAL LETTER U WITH CIRCUMFLEX */
XK_Udiaeresis =                  0x00dc, /* U+00DC LATIN CAPITAL LETTER U WITH DIAERESIS */
XK_Yacute =                      0x00dd, /* U+00DD LATIN CAPITAL LETTER Y WITH ACUTE */
XK_THORN =                       0x00de, /* U+00DE LATIN CAPITAL LETTER THORN */
XK_Thorn =                       0x00de, /* deprecated */
XK_ssharp =                      0x00df, /* U+00DF LATIN SMALL LETTER SHARP S */
XK_agrave =                      0x00e0, /* U+00E0 LATIN SMALL LETTER A WITH GRAVE */
XK_aacute =                      0x00e1, /* U+00E1 LATIN SMALL LETTER A WITH ACUTE */
XK_acircumflex =                 0x00e2, /* U+00E2 LATIN SMALL LETTER A WITH CIRCUMFLEX */
XK_atilde =                      0x00e3, /* U+00E3 LATIN SMALL LETTER A WITH TILDE */
XK_adiaeresis =                  0x00e4, /* U+00E4 LATIN SMALL LETTER A WITH DIAERESIS */
XK_aring =                       0x00e5, /* U+00E5 LATIN SMALL LETTER A WITH RING ABOVE */
XK_ae =                          0x00e6, /* U+00E6 LATIN SMALL LETTER AE */
XK_ccedilla =                    0x00e7, /* U+00E7 LATIN SMALL LETTER C WITH CEDILLA */
XK_egrave =                      0x00e8, /* U+00E8 LATIN SMALL LETTER E WITH GRAVE */
XK_eacute =                      0x00e9, /* U+00E9 LATIN SMALL LETTER E WITH ACUTE */
XK_ecircumflex =                 0x00ea, /* U+00EA LATIN SMALL LETTER E WITH CIRCUMFLEX */
XK_ediaeresis =                  0x00eb, /* U+00EB LATIN SMALL LETTER E WITH DIAERESIS */
XK_igrave =                      0x00ec, /* U+00EC LATIN SMALL LETTER I WITH GRAVE */
XK_iacute =                      0x00ed, /* U+00ED LATIN SMALL LETTER I WITH ACUTE */
XK_icircumflex =                 0x00ee, /* U+00EE LATIN SMALL LETTER I WITH CIRCUMFLEX */
XK_idiaeresis =                  0x00ef, /* U+00EF LATIN SMALL LETTER I WITH DIAERESIS */
XK_eth =                         0x00f0, /* U+00F0 LATIN SMALL LETTER ETH */
XK_ntilde =                      0x00f1, /* U+00F1 LATIN SMALL LETTER N WITH TILDE */
XK_ograve =                      0x00f2, /* U+00F2 LATIN SMALL LETTER O WITH GRAVE */
XK_oacute =                      0x00f3, /* U+00F3 LATIN SMALL LETTER O WITH ACUTE */
XK_ocircumflex =                 0x00f4, /* U+00F4 LATIN SMALL LETTER O WITH CIRCUMFLEX */
XK_otilde =                      0x00f5, /* U+00F5 LATIN SMALL LETTER O WITH TILDE */
XK_odiaeresis =                  0x00f6, /* U+00F6 LATIN SMALL LETTER O WITH DIAERESIS */
XK_division =                    0x00f7, /* U+00F7 DIVISION SIGN */
XK_oslash =                      0x00f8, /* U+00F8 LATIN SMALL LETTER O WITH STROKE */
XK_ooblique =                    0x00f8, /* U+00F8 LATIN SMALL LETTER O WITH STROKE */
XK_ugrave =                      0x00f9, /* U+00F9 LATIN SMALL LETTER U WITH GRAVE */
XK_uacute =                      0x00fa, /* U+00FA LATIN SMALL LETTER U WITH ACUTE */
XK_ucircumflex =                 0x00fb, /* U+00FB LATIN SMALL LETTER U WITH CIRCUMFLEX */
XK_udiaeresis =                  0x00fc, /* U+00FC LATIN SMALL LETTER U WITH DIAERESIS */
XK_yacute =                      0x00fd, /* U+00FD LATIN SMALL LETTER Y WITH ACUTE */
XK_thorn =                       0x00fe, /* U+00FE LATIN SMALL LETTER THORN */
XK_ydiaeresis =                  0x00ff; /* U+00FF LATIN SMALL LETTER Y WITH DIAERESIS */
//End of bower_components/no-vnc/include/keysym.js

return { RFB: RFB, WebUtil: WebUtil };
})(window);
