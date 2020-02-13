
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.Lemonade = {}));
}(this, (function (exports) { 'use strict';

  function _extends() {
    _extends = Object.assign || function (target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

    return _extends.apply(this, arguments);
  }

  function isAbsolute(pathname) {
    return pathname.charAt(0) === '/';
  }

  // About 1.5x faster than the two-arg version of Array#splice()
  function spliceOne(list, index) {
    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
      list[i] = list[k];
    }

    list.pop();
  }

  // This implementation is based heavily on node's url.parse
  function resolvePathname(to, from) {
    if (from === undefined) from = '';

    var toParts = (to && to.split('/')) || [];
    var fromParts = (from && from.split('/')) || [];

    var isToAbs = to && isAbsolute(to);
    var isFromAbs = from && isAbsolute(from);
    var mustEndAbs = isToAbs || isFromAbs;

    if (to && isAbsolute(to)) {
      // to is absolute
      fromParts = toParts;
    } else if (toParts.length) {
      // to is relative, drop the filename
      fromParts.pop();
      fromParts = fromParts.concat(toParts);
    }

    if (!fromParts.length) return '/';

    var hasTrailingSlash;
    if (fromParts.length) {
      var last = fromParts[fromParts.length - 1];
      hasTrailingSlash = last === '.' || last === '..' || last === '';
    } else {
      hasTrailingSlash = false;
    }

    var up = 0;
    for (var i = fromParts.length; i >= 0; i--) {
      var part = fromParts[i];

      if (part === '.') {
        spliceOne(fromParts, i);
      } else if (part === '..') {
        spliceOne(fromParts, i);
        up++;
      } else if (up) {
        spliceOne(fromParts, i);
        up--;
      }
    }

    if (!mustEndAbs) for (; up--; up) fromParts.unshift('..');

    if (
      mustEndAbs &&
      fromParts[0] !== '' &&
      (!fromParts[0] || !isAbsolute(fromParts[0]))
    )
      fromParts.unshift('');

    var result = fromParts.join('/');

    if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';

    return result;
  }

  function warning(condition, message) {
    {
      if (condition) {
        return;
      }

      var text = "Warning: " + message;

      if (typeof console !== 'undefined') {
        console.warn(text);
      }

      try {
        throw Error(text);
      } catch (x) {}
    }
  }

  var prefix = 'Invariant failed';
  function invariant(condition, message) {
      if (condition) {
          return;
      }
      throw new Error(prefix + ": " + (message || ''));
  }

  function addLeadingSlash(path) {
    return path.charAt(0) === '/' ? path : '/' + path;
  }
  function hasBasename(path, prefix) {
    return path.toLowerCase().indexOf(prefix.toLowerCase()) === 0 && '/?#'.indexOf(path.charAt(prefix.length)) !== -1;
  }
  function stripBasename(path, prefix) {
    return hasBasename(path, prefix) ? path.substr(prefix.length) : path;
  }
  function stripTrailingSlash(path) {
    return path.charAt(path.length - 1) === '/' ? path.slice(0, -1) : path;
  }
  function parsePath(path) {
    var pathname = path || '/';
    var search = '';
    var hash = '';
    var hashIndex = pathname.indexOf('#');

    if (hashIndex !== -1) {
      hash = pathname.substr(hashIndex);
      pathname = pathname.substr(0, hashIndex);
    }

    var searchIndex = pathname.indexOf('?');

    if (searchIndex !== -1) {
      search = pathname.substr(searchIndex);
      pathname = pathname.substr(0, searchIndex);
    }

    return {
      pathname: pathname,
      search: search === '?' ? '' : search,
      hash: hash === '#' ? '' : hash
    };
  }
  function createPath(location) {
    var pathname = location.pathname,
        search = location.search,
        hash = location.hash;
    var path = pathname || '/';
    if (search && search !== '?') path += search.charAt(0) === '?' ? search : "?" + search;
    if (hash && hash !== '#') path += hash.charAt(0) === '#' ? hash : "#" + hash;
    return path;
  }

  function createLocation(path, state, key, currentLocation) {
    var location;

    if (typeof path === 'string') {
      // Two-arg form: push(path, state)
      location = parsePath(path);
      location.state = state;
    } else {
      // One-arg form: push(location)
      location = _extends({}, path);
      if (location.pathname === undefined) location.pathname = '';

      if (location.search) {
        if (location.search.charAt(0) !== '?') location.search = '?' + location.search;
      } else {
        location.search = '';
      }

      if (location.hash) {
        if (location.hash.charAt(0) !== '#') location.hash = '#' + location.hash;
      } else {
        location.hash = '';
      }

      if (state !== undefined && location.state === undefined) location.state = state;
    }

    try {
      location.pathname = decodeURI(location.pathname);
    } catch (e) {
      if (e instanceof URIError) {
        throw new URIError('Pathname "' + location.pathname + '" could not be decoded. ' + 'This is likely caused by an invalid percent-encoding.');
      } else {
        throw e;
      }
    }

    if (key) location.key = key;

    if (currentLocation) {
      // Resolve incomplete/relative pathname relative to current location.
      if (!location.pathname) {
        location.pathname = currentLocation.pathname;
      } else if (location.pathname.charAt(0) !== '/') {
        location.pathname = resolvePathname(location.pathname, currentLocation.pathname);
      }
    } else {
      // When there is no prior location and pathname is empty, set it to /
      if (!location.pathname) {
        location.pathname = '/';
      }
    }

    return location;
  }

  function createTransitionManager() {
    var prompt = null;

    function setPrompt(nextPrompt) {
       warning(prompt == null, 'A history supports only one prompt at a time') ;
      prompt = nextPrompt;
      return function () {
        if (prompt === nextPrompt) prompt = null;
      };
    }

    function confirmTransitionTo(location, action, getUserConfirmation, callback) {
      // TODO: If another transition starts while we're still confirming
      // the previous one, we may end up in a weird state. Figure out the
      // best way to handle this.
      if (prompt != null) {
        var result = typeof prompt === 'function' ? prompt(location, action) : prompt;

        if (typeof result === 'string') {
          if (typeof getUserConfirmation === 'function') {
            getUserConfirmation(result, callback);
          } else {
             warning(false, 'A history needs a getUserConfirmation function in order to use a prompt message') ;
            callback(true);
          }
        } else {
          // Return false from a transition hook to cancel the transition.
          callback(result !== false);
        }
      } else {
        callback(true);
      }
    }

    var listeners = [];

    function appendListener(fn) {
      var isActive = true;

      function listener() {
        if (isActive) fn.apply(void 0, arguments);
      }

      listeners.push(listener);
      return function () {
        isActive = false;
        listeners = listeners.filter(function (item) {
          return item !== listener;
        });
      };
    }

    function notifyListeners() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      listeners.forEach(function (listener) {
        return listener.apply(void 0, args);
      });
    }

    return {
      setPrompt: setPrompt,
      confirmTransitionTo: confirmTransitionTo,
      appendListener: appendListener,
      notifyListeners: notifyListeners
    };
  }

  var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);
  function getConfirmation(message, callback) {
    callback(window.confirm(message)); // eslint-disable-line no-alert
  }
  /**
   * Returns true if the HTML5 history API is supported. Taken from Modernizr.
   *
   * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
   * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
   * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
   */

  function supportsHistory() {
    var ua = window.navigator.userAgent;
    if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) return false;
    return window.history && 'pushState' in window.history;
  }
  /**
   * Returns true if browser fires popstate on hash change.
   * IE10 and IE11 do not.
   */

  function supportsPopStateOnHashChange() {
    return window.navigator.userAgent.indexOf('Trident') === -1;
  }
  /**
   * Returns true if a given popstate event is an extraneous WebKit event.
   * Accounts for the fact that Chrome on iOS fires real popstate events
   * containing undefined state when pressing the back button.
   */

  function isExtraneousPopstateEvent(event) {
    return event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1;
  }

  var PopStateEvent = 'popstate';
  var HashChangeEvent = 'hashchange';

  function getHistoryState() {
    try {
      return window.history.state || {};
    } catch (e) {
      // IE 11 sometimes throws when accessing window.history.state
      // See https://github.com/ReactTraining/history/pull/289
      return {};
    }
  }
  /**
   * Creates a history object that uses the HTML5 history API including
   * pushState, replaceState, and the popstate event.
   */


  function createBrowserHistory(props) {
    if (props === void 0) {
      props = {};
    }

    !canUseDOM ?  invariant(false, 'Browser history needs a DOM')  : void 0;
    var globalHistory = window.history;
    var canUseHistory = supportsHistory();
    var needsHashChangeListener = !supportsPopStateOnHashChange();
    var _props = props,
        _props$forceRefresh = _props.forceRefresh,
        forceRefresh = _props$forceRefresh === void 0 ? false : _props$forceRefresh,
        _props$getUserConfirm = _props.getUserConfirmation,
        getUserConfirmation = _props$getUserConfirm === void 0 ? getConfirmation : _props$getUserConfirm,
        _props$keyLength = _props.keyLength,
        keyLength = _props$keyLength === void 0 ? 6 : _props$keyLength;
    var basename = props.basename ? stripTrailingSlash(addLeadingSlash(props.basename)) : '';

    function getDOMLocation(historyState) {
      var _ref = historyState || {},
          key = _ref.key,
          state = _ref.state;

      var _window$location = window.location,
          pathname = _window$location.pathname,
          search = _window$location.search,
          hash = _window$location.hash;
      var path = pathname + search + hash;
       warning(!basename || hasBasename(path, basename), 'You are attempting to use a basename on a page whose URL path does not begin ' + 'with the basename. Expected path "' + path + '" to begin with "' + basename + '".') ;
      if (basename) path = stripBasename(path, basename);
      return createLocation(path, state, key);
    }

    function createKey() {
      return Math.random().toString(36).substr(2, keyLength);
    }

    var transitionManager = createTransitionManager();

    function setState(nextState) {
      _extends(history, nextState);

      history.length = globalHistory.length;
      transitionManager.notifyListeners(history.location, history.action);
    }

    function handlePopState(event) {
      // Ignore extraneous popstate events in WebKit.
      if (isExtraneousPopstateEvent(event)) return;
      handlePop(getDOMLocation(event.state));
    }

    function handleHashChange() {
      handlePop(getDOMLocation(getHistoryState()));
    }

    var forceNextPop = false;

    function handlePop(location) {
      if (forceNextPop) {
        forceNextPop = false;
        setState();
      } else {
        var action = 'POP';
        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
          if (ok) {
            setState({
              action: action,
              location: location
            });
          } else {
            revertPop(location);
          }
        });
      }
    }

    function revertPop(fromLocation) {
      var toLocation = history.location; // TODO: We could probably make this more reliable by
      // keeping a list of keys we've seen in sessionStorage.
      // Instead, we just default to 0 for keys we don't know.

      var toIndex = allKeys.indexOf(toLocation.key);
      if (toIndex === -1) toIndex = 0;
      var fromIndex = allKeys.indexOf(fromLocation.key);
      if (fromIndex === -1) fromIndex = 0;
      var delta = toIndex - fromIndex;

      if (delta) {
        forceNextPop = true;
        go(delta);
      }
    }

    var initialLocation = getDOMLocation(getHistoryState());
    var allKeys = [initialLocation.key]; // Public interface

    function createHref(location) {
      return basename + createPath(location);
    }

    function push(path, state) {
       warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') ;
      var action = 'PUSH';
      var location = createLocation(path, state, createKey(), history.location);
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (!ok) return;
        var href = createHref(location);
        var key = location.key,
            state = location.state;

        if (canUseHistory) {
          globalHistory.pushState({
            key: key,
            state: state
          }, null, href);

          if (forceRefresh) {
            window.location.href = href;
          } else {
            var prevIndex = allKeys.indexOf(history.location.key);
            var nextKeys = allKeys.slice(0, prevIndex + 1);
            nextKeys.push(location.key);
            allKeys = nextKeys;
            setState({
              action: action,
              location: location
            });
          }
        } else {
           warning(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history') ;
          window.location.href = href;
        }
      });
    }

    function replace(path, state) {
       warning(!(typeof path === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') ;
      var action = 'REPLACE';
      var location = createLocation(path, state, createKey(), history.location);
      transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
        if (!ok) return;
        var href = createHref(location);
        var key = location.key,
            state = location.state;

        if (canUseHistory) {
          globalHistory.replaceState({
            key: key,
            state: state
          }, null, href);

          if (forceRefresh) {
            window.location.replace(href);
          } else {
            var prevIndex = allKeys.indexOf(history.location.key);
            if (prevIndex !== -1) allKeys[prevIndex] = location.key;
            setState({
              action: action,
              location: location
            });
          }
        } else {
           warning(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history') ;
          window.location.replace(href);
        }
      });
    }

    function go(n) {
      globalHistory.go(n);
    }

    function goBack() {
      go(-1);
    }

    function goForward() {
      go(1);
    }

    var listenerCount = 0;

    function checkDOMListeners(delta) {
      listenerCount += delta;

      if (listenerCount === 1 && delta === 1) {
        window.addEventListener(PopStateEvent, handlePopState);
        if (needsHashChangeListener) window.addEventListener(HashChangeEvent, handleHashChange);
      } else if (listenerCount === 0) {
        window.removeEventListener(PopStateEvent, handlePopState);
        if (needsHashChangeListener) window.removeEventListener(HashChangeEvent, handleHashChange);
      }
    }

    var isBlocked = false;

    function block(prompt) {
      if (prompt === void 0) {
        prompt = false;
      }

      var unblock = transitionManager.setPrompt(prompt);

      if (!isBlocked) {
        checkDOMListeners(1);
        isBlocked = true;
      }

      return function () {
        if (isBlocked) {
          isBlocked = false;
          checkDOMListeners(-1);
        }

        return unblock();
      };
    }

    function listen(listener) {
      var unlisten = transitionManager.appendListener(listener);
      checkDOMListeners(1);
      return function () {
        checkDOMListeners(-1);
        unlisten();
      };
    }

    var history = {
      length: globalHistory.length,
      action: 'POP',
      location: initialLocation,
      createHref: createHref,
      push: push,
      replace: replace,
      go: go,
      goBack: goBack,
      goForward: goForward,
      block: block,
      listen: listen
    };
    return history;
  }

  /**
   * Tokenize input string.
   */
  function lexer(str) {
      var tokens = [];
      var i = 0;
      while (i < str.length) {
          var char = str[i];
          if (char === "*" || char === "+" || char === "?") {
              tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
              continue;
          }
          if (char === "\\") {
              tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
              continue;
          }
          if (char === "{") {
              tokens.push({ type: "OPEN", index: i, value: str[i++] });
              continue;
          }
          if (char === "}") {
              tokens.push({ type: "CLOSE", index: i, value: str[i++] });
              continue;
          }
          if (char === ":") {
              var name = "";
              var j = i + 1;
              while (j < str.length) {
                  var code = str.charCodeAt(j);
                  if (
                  // `0-9`
                  (code >= 48 && code <= 57) ||
                      // `A-Z`
                      (code >= 65 && code <= 90) ||
                      // `a-z`
                      (code >= 97 && code <= 122) ||
                      // `_`
                      code === 95) {
                      name += str[j++];
                      continue;
                  }
                  break;
              }
              if (!name)
                  throw new TypeError("Missing parameter name at " + i);
              tokens.push({ type: "NAME", index: i, value: name });
              i = j;
              continue;
          }
          if (char === "(") {
              var count = 1;
              var pattern = "";
              var j = i + 1;
              if (str[j] === "?") {
                  throw new TypeError("Pattern cannot start with \"?\" at " + j);
              }
              while (j < str.length) {
                  if (str[j] === "\\") {
                      pattern += str[j++] + str[j++];
                      continue;
                  }
                  if (str[j] === ")") {
                      count--;
                      if (count === 0) {
                          j++;
                          break;
                      }
                  }
                  else if (str[j] === "(") {
                      count++;
                      if (str[j + 1] !== "?") {
                          throw new TypeError("Capturing groups are not allowed at " + j);
                      }
                  }
                  pattern += str[j++];
              }
              if (count)
                  throw new TypeError("Unbalanced pattern at " + i);
              if (!pattern)
                  throw new TypeError("Missing pattern at " + i);
              tokens.push({ type: "PATTERN", index: i, value: pattern });
              i = j;
              continue;
          }
          tokens.push({ type: "CHAR", index: i, value: str[i++] });
      }
      tokens.push({ type: "END", index: i, value: "" });
      return tokens;
  }
  /**
   * Parse a string for the raw tokens.
   */
  function parse(str, options) {
      if (options === void 0) { options = {}; }
      var tokens = lexer(str);
      var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a;
      var defaultPattern = "[^" + escapeString(options.delimiter || "/#?") + "]+?";
      var result = [];
      var key = 0;
      var i = 0;
      var path = "";
      var tryConsume = function (type) {
          if (i < tokens.length && tokens[i].type === type)
              return tokens[i++].value;
      };
      var mustConsume = function (type) {
          var value = tryConsume(type);
          if (value !== undefined)
              return value;
          var _a = tokens[i], nextType = _a.type, index = _a.index;
          throw new TypeError("Unexpected " + nextType + " at " + index + ", expected " + type);
      };
      var consumeText = function () {
          var result = "";
          var value;
          // tslint:disable-next-line
          while ((value = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR"))) {
              result += value;
          }
          return result;
      };
      while (i < tokens.length) {
          var char = tryConsume("CHAR");
          var name = tryConsume("NAME");
          var pattern = tryConsume("PATTERN");
          if (name || pattern) {
              var prefix = char || "";
              if (prefixes.indexOf(prefix) === -1) {
                  path += prefix;
                  prefix = "";
              }
              if (path) {
                  result.push(path);
                  path = "";
              }
              result.push({
                  name: name || key++,
                  prefix: prefix,
                  suffix: "",
                  pattern: pattern || defaultPattern,
                  modifier: tryConsume("MODIFIER") || ""
              });
              continue;
          }
          var value = char || tryConsume("ESCAPED_CHAR");
          if (value) {
              path += value;
              continue;
          }
          if (path) {
              result.push(path);
              path = "";
          }
          var open = tryConsume("OPEN");
          if (open) {
              var prefix = consumeText();
              var name_1 = tryConsume("NAME") || "";
              var pattern_1 = tryConsume("PATTERN") || "";
              var suffix = consumeText();
              mustConsume("CLOSE");
              result.push({
                  name: name_1 || (pattern_1 ? key++ : ""),
                  pattern: name_1 && !pattern_1 ? defaultPattern : pattern_1,
                  prefix: prefix,
                  suffix: suffix,
                  modifier: tryConsume("MODIFIER") || ""
              });
              continue;
          }
          mustConsume("END");
      }
      return result;
  }
  /**
   * Escape a regular expression string.
   */
  function escapeString(str) {
      return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
  }
  /**
   * Get the flags for a regexp from the options.
   */
  function flags(options) {
      return options && options.sensitive ? "" : "i";
  }
  /**
   * Pull out keys from a regexp.
   */
  function regexpToRegexp(path, keys) {
      if (!keys)
          return path;
      // Use a negative lookahead to match only capturing groups.
      var groups = path.source.match(/\((?!\?)/g);
      if (groups) {
          for (var i = 0; i < groups.length; i++) {
              keys.push({
                  name: i,
                  prefix: "",
                  suffix: "",
                  modifier: "",
                  pattern: ""
              });
          }
      }
      return path;
  }
  /**
   * Transform an array into a regexp.
   */
  function arrayToRegexp(paths, keys, options) {
      var parts = paths.map(function (path) { return pathToRegexp(path, keys, options).source; });
      return new RegExp("(?:" + parts.join("|") + ")", flags(options));
  }
  /**
   * Create a path regexp from string input.
   */
  function stringToRegexp(path, keys, options) {
      return tokensToRegexp(parse(path, options), keys, options);
  }
  /**
   * Expose a function for taking tokens and returning a RegExp.
   */
  function tokensToRegexp(tokens, keys, options) {
      if (options === void 0) { options = {}; }
      var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function (x) { return x; } : _d;
      var endsWith = "[" + escapeString(options.endsWith || "") + "]|$";
      var delimiter = "[" + escapeString(options.delimiter || "/#?") + "]";
      var route = start ? "^" : "";
      // Iterate over the tokens and create our regexp string.
      for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
          var token = tokens_1[_i];
          if (typeof token === "string") {
              route += escapeString(encode(token));
          }
          else {
              var prefix = escapeString(encode(token.prefix));
              var suffix = escapeString(encode(token.suffix));
              if (token.pattern) {
                  if (keys)
                      keys.push(token);
                  if (prefix || suffix) {
                      if (token.modifier === "+" || token.modifier === "*") {
                          var mod = token.modifier === "*" ? "?" : "";
                          route += "(?:" + prefix + "((?:" + token.pattern + ")(?:" + suffix + prefix + "(?:" + token.pattern + "))*)" + suffix + ")" + mod;
                      }
                      else {
                          route += "(?:" + prefix + "(" + token.pattern + ")" + suffix + ")" + token.modifier;
                      }
                  }
                  else {
                      route += "(" + token.pattern + ")" + token.modifier;
                  }
              }
              else {
                  route += "(?:" + prefix + suffix + ")" + token.modifier;
              }
          }
      }
      if (end) {
          if (!strict)
              route += delimiter + "?";
          route += !options.endsWith ? "$" : "(?=" + endsWith + ")";
      }
      else {
          var endToken = tokens[tokens.length - 1];
          var isEndDelimited = typeof endToken === "string"
              ? delimiter.indexOf(endToken[endToken.length - 1]) > -1
              : // tslint:disable-next-line
                  endToken === undefined;
          if (!strict) {
              route += "(?:" + delimiter + "(?=" + endsWith + "))?";
          }
          if (!isEndDelimited) {
              route += "(?=" + delimiter + "|" + endsWith + ")";
          }
      }
      return new RegExp(route, flags(options));
  }
  /**
   * Normalize the given path string, returning a regular expression.
   *
   * An empty array can be passed in for the keys, which will hold the
   * placeholder key descriptions. For example, using `/user/:id`, `keys` will
   * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
   */
  function pathToRegexp(path, keys, options) {
      if (path instanceof RegExp)
          return regexpToRegexp(path, keys);
      if (Array.isArray(path))
          return arrayToRegexp(path, keys, options);
      return stringToRegexp(path, keys, options);
  }

  function getPath(url) {
      return parse$1(url).path;
  }

  function parse$1(url) {
      let path = url.replace(window.location.origin, '');

      return { path };
  }

  function hasBasename$1(path, prefix) {
      return new RegExp('^' + prefix + '(\\/|\\?|#|$)', 'i').test(path);
  }

  function addBasename(path, prefix) {
      return hasBasename$1(path, prefix) ? path : (prefix + path);
  }

  function retrieveHref(element) {
      if (element) {
          const xlink = element.getAttribute && element.getAttribute('xlink:href');

          if (typeof xlink === 'string') {
              return xlink;
          }

          if (element.href) {
              return element.href;
          }
      }

      return false;
  }

  function preventClick(event, element) {
      const href = retrieveHref(element);
      const withKey = event.which > 1 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
      const blankTarget = element.target && element.target === '_blank';
      const differentDomain = window.location.protocol !== element.protocol || window.location.hostname !== element.hostname;
      const isDownload = element.getAttribute('download') === 'string';
      const isMailto = href && href.includes('mailto:');
      const shouldPrevent = !withKey && !blankTarget && !differentDomain && !isDownload && !isMailto;

      return shouldPrevent;
  }

  function DefaultTransition() {
      function play(prevView, nextView) {
          if (prevView) {
              prevView.leave(nextView);
          }

          nextView.enter(prevView);
      }

      return {
          play,
      }
  }

  function Router({
      defaultTransition = DefaultTransition(),
      basename = '',
      scrollRestoration = 'auto',
      transitionParams = {},
  } = {}) {
      const matches = [];
      const transitions = [];
      const views = new Map();

      let history = createBrowserHistory();
      let prevView = null;
      let nextLocation = null;
      let prevPathname = null;
      let ignoreClass = null;

      window.history.scrollRestoration = scrollRestoration;

      /*
      * Register URL pattern
      * @param {string|array} urls
      * @param {function} fn
      */
      function match(urls, fn) {
          if (!Array.isArray(urls)) {
              urls = [urls];
          }

          urls = urls.map(url => addBasename(url, basename));

          matches.push({ urls, fn });
      }

      /*
      * Register transition from one or multiple URLs to other(s)
      * @param {string|array} fromURLs - 
      * @param {string|array} toURLs - 
      * @param {function} fn - 
      * @param {boolean} backAndForth -
      */
      function transition(fromURLs, toURLs, fn, backAndForth = true) {
          fromURLs = !Array.isArray(fromURLs) ? [fromURLs] : fromURLs;
          toURLs = !Array.isArray(toURLs) ? [toURLs] : toURLs;

          transitions.push({ fromURLs, toURLs, fn, backAndForth });
      }

      /*
      * Register view for one or multiple URLs
      * @param {string|array} urls -
      * @param {function} fn -
      */
      function view(urls, fn) {
          const view = fn();

          if (!Array.isArray(urls)) {
              urls = [urls];
          }

          for (let i = 0; i < urls.length; i++) {
              let url = addBasename(urls[i], basename);
              views.set(url, view);
          }
      }

      function goTo(href) {
          let path = getPath(href);

          if (path === window.location.pathname) return;

          history.push(addBasename(path, basename));
      }

      async function apply(location, prevPathname) {
          try {
              const pathname = addBasename(location.pathname, basename);

              let nextView;

              if (views.has(pathname)) {
                  nextView = views.get(pathname);
              } else {
                  for (let i = 0; i < matches.length; i++) {
                      const { urls, fn } = matches[i];

                      for (let j = 0; j < urls.length; j++) {
                          const keys = [];
                          const regex = urls[j] === '*' ? /^\/.*(?:\/)?$/i : pathToRegexp(urls[j], keys);
                          const match = regex.exec(pathname);

                          if (match && match.length > 0) {
                              const [url, ...values] = match;
                              const params = keys.reduce((acc, key, index) => {
                                  acc[key.name] = values[index];
                                  return acc;
                              }, {});

                              // remove urls with params
                              const all = [...urls, pathname].filter(u => !u.includes(':'));

                              await fn({ urls: all, url: pathname, params });

                              if (views.has(pathname)) {
                                  nextView = views.get(pathname);
                              }

                              break;
                          }
                      }

                      if (nextView) break;
                  }
              }

              if (nextView) {
                  nextLocation = pathname;

                  if (transitions.length > 0) {
                      for (let i = 0; i < transitions.length; i++) {
                          const { fromURLs, toURLs, backAndForth, fn } = transitions[i];

                          const matchFrom = fromURLs.includes('*') || fromURLs.includes(prevPathname);
                          const reverseMatchFrom = backAndForth && fromURLs.includes(pathname);
                          const matchTo = toURLs.includes('*') || toURLs.includes(pathname);
                          const reverseMatchTo = backAndForth && toURLs.includes(prevPathname);

                          if ((matchFrom && matchTo) || (reverseMatchFrom && reverseMatchTo)) {
                              const transition = await fn();

                              await transition.play(prevView, nextView, transitionParams);

                              prevView = nextView;
                          } else {
                              await defaultTransition.play(prevView, nextView, transitionParams);
                              prevView = nextView;
                          }
                      }
                  } else {
                      await defaultTransition.play(prevView, nextView, transitionParams);
                      prevView = nextView;
                  }
              } else {
                  console.error('Router :: View not found', views);
              }
          } catch (error) {
              console.error(error);
          }
      }

      /* 
      * Start listening to URL changes
      * @param {object} options -
      * @param {boolean} options.clickEvents - 
      * @param {string} options.clickIgnoreClass -
      */
      function listen({ clickEvents = false, clickIgnoreClass = 'no-router' } = {}) {
          ignoreClass = clickIgnoreClass;
          prevPathname = getPath(window.location.href);

          history.listen((location) => {
              prevPathname = getPath(window.location.href);

              apply(location, prevPathname);
          });

          apply(window.location, prevPathname);

          if (clickEvents) {
              document.addEventListener('click', (event) => {
                  let target = event.target;

                  while (target && !retrieveHref(target)) {
                      target = target.parentNode;
                  }

                  if (target && preventClick(event, target) && !target.classList.contains(ignoreClass)) {
                      event.preventDefault();
                      event.stopPropagation();

                      const href = retrieveHref(target);
                      const url = getPath(href);
                      router.goTo(url);
                  }
              });
          }
      }

      return {
          match,
          transition,
          view,
          listen,
          goTo,
          prev: history.goBack,
          next: history.goForward,
          nextLocation: () => nextLocation,
      }
  }

  function DefaultTransitionDOM() {
      async function play(prevView, nextView, { loadView, appendView, removeView }) {
          if (prevView) {
              await prevView.leave(nextView);
              await loadView(); // must be called before appendView
              appendView();
              removeView();
          }

          await nextView.enter(prevView);
      }

      return {
          play,
      };
  }

  function RouterDOM({
      wrapperClass = '.lemonade-wrapper',
      containerClass = '.lemonade-container',
      ignoreClass = 'no-router',
      cacheEnabled = true,
      defaultTransition = DefaultTransitionDOM(),
      transitionParams = {},
      basename = ''
  } = {}) {
      let router = Router({
          defaultTransition,
          basename,
          ignoreClass,
          transitionParams: {
              ...transitionParams,
              loadView,
              appendView,
              removeView,
          }
      });
      let cache = new Map();
      let $wrapper, $prevContainer, $nextContainer;

      function listen({ clickEvents = false, clickIgnoreClass = 'no-router' } = {}) {
          $wrapper = document.querySelector(wrapperClass);
          $prevContainer = $wrapper.querySelector(containerClass);

          router.listen({ clickEvents, clickIgnoreClass });

          if (cacheEnabled) {
              cache.set(getPath(window.location.href), document.documentElement.innerHTML);
          }
      }

      async function loadView() {
          let html;
          let nextLocation = router.nextLocation();

          if (cacheEnabled && cache.get(nextLocation)) {
              html = cache.get(nextLocation);
          } else {
              const response = await RouterDOM.fetch(nextLocation);
              html = response.result;

              if (cacheEnabled) {
                  cache.set(nextLocation, html);
              }
          }

          const temp = document.createElement('div');
          temp.innerHTML = html;

          const title = temp.querySelector('title');

          if (title) {
              document.title = title.textContent;
          }

          $prevContainer = $wrapper.querySelector(containerClass);
          $nextContainer = temp.querySelector(containerClass);

          return $nextContainer;
      }

      function appendView() {
          $wrapper.appendChild($nextContainer);
      }

      function removeView() {
          $prevContainer.parentNode.removeChild($prevContainer);
      }

      return {
          listen: listen,
          match: router.match,
          view: router.view,
          transition: router.transition,
          goTo: router.goTo,
      }
  }

  RouterDOM.fetch = async (url) => {
      let response = await fetch(url);
      let html = await response.text();

      return html;
  };

  // RouterDOM.fetch = async () => {
  //     let html = await Thread.fetch(nextLocation, {
  //         format: 'text',
  //     });

  //     return html;
  // };

  exports.RouterDOM = RouterDOM;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
