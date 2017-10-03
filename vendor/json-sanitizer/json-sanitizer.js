/**
 * Sanitize a JSON-like string containing. For example changes JavaScript
 * notation into JSON notation.
 * This function for example changes a string like "{a: 2, 'b': {c: 'd'}"
 * into '{"a": 2, "b": {"c": "d"}'
 * @param {string} jsString
 * @returns {string} json
 */

(function () {
  function generateModule(name, values) {
    define(name, [], function () {
      'use strict';
      return values;
    });
  }
  generateModule('json-sanitizer', {
    'default': function sanitize(jsString) {
      // escape all single and double quotes inside strings
      var chars = [];
      var i = 0;

      //If JSON starts with a function (characters/digits/"_-"), remove this function.
      //This is useful for "stripping" JSONP objects to become JSON
      //For example: /* some comment */ function_12321321 ( [{"a":"b"}] ); => [{"a":"b"}]
      var match = jsString.match(/^\s*(\/\*(.|[\r\n])*?\*\/)?\s*[\da-zA-Z_$]+\s*\(([\s\S]*)\)\s*;?\s*$/);
      if (match) {
        jsString = match[3];
      }

      // helper functions to get the current/prev/next character
      function curr() { return jsString.charAt(i); }
      function next() { return jsString.charAt(i + 1); }
      function prev() { return jsString.charAt(i - 1); }

      // get the last parsed non-whitespace character
      function lastNonWhitespace() {
        var p = chars.length - 1;

        while (p >= 0) {
          var pp = chars[p];
          if (pp !== ' ' && pp !== '\n' && pp !== '\r' && pp !== '\t') { // non whitespace
            return pp;
          }
          p--;
        }

        return '';
      }

      // skip a block comment '/* ... */'
      function skipBlockComment() {
        i += 2;
        while (i < jsString.length && (curr() !== '*' || next() !== '/')) {
          i++;
        }
        i += 2;
      }

      // skip a comment '// ...'
      function skipComment() {
        i += 2;
        while (i < jsString.length && (curr() !== '\n')) {
          i++;
        }
      }

      // parse single or double quoted string
      function parseString(quote) {
        chars.push('"');
        i++;
        var c = curr();
        while (i < jsString.length && c !== quote) {
          if (c === '"' && prev() !== '\\') {
            // unescaped double quote, escape it
            chars.push('\\');
          }

          // handle escape character
          if (c === '\\') {
            i++;
            c = curr();

            // remove the escape character when followed by a single quote ', not needed
            if (c !== '\'') {
              chars.push('\\');
            }
          }
          chars.push(c);

          i++;
          c = curr();
        }
        if (c === quote) {
          chars.push('"');
          i++;
        }
      }

      // parse an unquoted key
      function parseKey() {
        var specialValues = ['null', 'true', 'false'];
        var key = '';
        var c = curr();

        var regexp = /[a-zA-Z_$\d]/; // letter, number, underscore, dollar character
        while (regexp.test(c)) {
          key += c;
          i++;
          c = curr();
        }

        if (specialValues.indexOf(key) === -1) {
          chars.push('"' + key + '"');
        }
        else {
          chars.push(key);
        }
      }

      // parse an unquoted value
      function parseValue() {
        var specialValues = ['null', 'true', 'false'];
        var key = '';
        var c = curr();

        while (i < jsString.length && [',', '}', ']'].indexOf(c) === -1) {
          key += c;
          i++;
          c = curr();
        }

        key = key.trim()

        if (specialValues.indexOf(key) === -1 && !(key + '').match(/^([0-9]+\.)?[0-9]*$/)) {
          chars.push('"' + key + '"');
        }
        else {
          chars.push(key);
        }
      }

      function isTrailingComma() {
        var idx = i+1;
        var c = jsString.charAt(idx);

        while ( idx < jsString.length && [' ','\n','\r','\t'].indexOf(c) >= 0) {
          idx++;
          c = jsString.charAt(idx);
        }

        if ( ['}',']'].indexOf(c) >= 0 ) {
          return true;
        }

        return false;
      }

      while (i < jsString.length) {
        var c = curr();

        if (c === '/' && next() === '*') {
          skipBlockComment();
        }
        else if (c === '/' && next() === '/') {
          skipComment();
        }
        else if (c === '\'' || c === '"') {
          parseString(c);
        }
        else if (/[a-zA-Z_$]/.test(c) && ['{', ','].indexOf(lastNonWhitespace()) !== -1) {
          // an unquoted object key (like a in '{a:2}')
          parseKey();
        }
        else if (c.trim() !== '' && ['[', '{'].indexOf(c) === -1 && ':' === lastNonWhitespace()) {
          // an unquoted object value (like b in '{a:b}')
          parseValue();
        }
        else if ( c === ',' && isTrailingComma() ) {
          i++;
        }
        else {
          chars.push(c);
          i++;
        }
      }

      return chars.join('');
    }
  });
})();
