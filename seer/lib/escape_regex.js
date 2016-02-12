/*
 * Escape Regex
 * http://stackoverflow.com/a/6969486
 */

var escapeRegEx = (function () {
    'use strict';

    return {
        escapeRegExChars: function (str) {
            return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
        },

        isNumber: function (obj) {
            return typeof obj === 'number';
        },

        isUndefined: function (obj) {
            return typeof obj === 'undefined';
        },

        noop: function () {
        }
    };
})();
