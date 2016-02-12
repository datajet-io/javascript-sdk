/*
 * typeahead.js
 * https://github.com/twitter/typeahead.js
 * Copyright 2013-2014 Twitter, Inc. and other contributors; Licensed MIT
 */

var PersistentStorage = (function() {
  'use strict';

  var ls, methods;

  try {
    ls = window.localStorage;

    // while in private browsing mode, some browsers make
    // localStorage available, but throw an error when used
    ls.setItem('~~~', '!');
    ls.removeItem('~~~');
  } catch (err) {
    ls = null;
  }

  // constructor
  // -----------

  function PersistentStorage(namespace) {
    this.prefix = ['__', namespace, '__'].join('');
    this.ttlKey = '__ttl__';
    this.keyMatcher = new RegExp('^' + escapeRegEx.escapeRegExChars(this.prefix));
  }

  // instance methods
  // ----------------

  if (ls && window.JSON) {
    // ### private

    PersistentStorage.prototype._prefix = function(key) {
        return this.prefix + key;
    };

    PersistentStorage.prototype._ttlKey = function(key) {
        return this._prefix(key) + this.ttlKey;
    };

    // ### public

    PersistentStorage.prototype.get = function(key) {
        if (this.isExpired(key)) {
          this.remove(key);
        }

        return decode(ls.getItem(this._prefix(key)));
    };

    PersistentStorage.prototype.set = function(key, val, ttl) {
        if (escapeRegEx.isNumber(ttl)) {
          ls.setItem(this._ttlKey(key), encode(now() + ttl));
        }
        else {
          ls.removeItem(this._ttlKey(key));
        }

        return ls.setItem(this._prefix(key), encode(val));
    };

    PersistentStorage.prototype.remove = function(key) {
        ls.removeItem(this._ttlKey(key));
        ls.removeItem(this._prefix(key));

        return this;
    };

    PersistentStorage.prototype.clear = function() {
        var i, key, keys = [], len = ls.length;

        for (i = 0; i < len; i++) {
          if ((key = ls.key(i)).match(this.keyMatcher)) {
            // gather keys to remove after loop exits
            keys.push(key.replace(this.keyMatcher, ''));
          }
        }

        for (i = keys.length; i--;) {
          this.remove(keys[i]);
        }

        return this;
    };

    PersistentStorage.prototype.isExpired = function(key) {
        var ttl = decode(ls.getItem(this._ttlKey(key)));

        return escapeRegEx.isNumber(ttl) && now() > ttl ? true : false;
    };
  }
  else {
    PersistentStorage.prototype.get = escapeRegEx.noop;
    PersistentStorage.prototype.set = escapeRegEx.noop;
    PersistentStorage.prototype.remove = escapeRegEx.noop;
    PersistentStorage.prototype.clear = escapeRegEx.noop;
    PersistentStorage.prototype.isExpired = escapeRegEx.noop;
  }

  return PersistentStorage;

  // helper functions
  // ----------------

  function now() {
    return new Date().getTime();
  }

  function encode(val) {
    // convert undefined to null to avoid issues with JSON.parse
    return JSON.stringify(escapeRegEx.isUndefined(val) ? null : val);
  }

  function decode(val) {
    return JSON.parse(val);
  }
})();
