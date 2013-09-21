
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};
require.register("component-matches-selector/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var query = require('query');

/**
 * Element prototype.
 */

var proto = Element.prototype;

/**
 * Vendor function.
 */

var vendor = proto.matchesSelector
  || proto.webkitMatchesSelector
  || proto.mozMatchesSelector
  || proto.msMatchesSelector
  || proto.oMatchesSelector;

/**
 * Expose `match()`.
 */

module.exports = match;

/**
 * Match `el` to `selector`.
 *
 * @param {Element} el
 * @param {String} selector
 * @return {Boolean}
 * @api public
 */

function match(el, selector) {
  if (vendor) return vendor.call(el, selector);
  var nodes = query.all(selector, el.parentNode);
  for (var i = 0; i < nodes.length; ++i) {
    if (nodes[i] == el) return true;
  }
  return false;
}

});
require.register("yields-traverse/index.js", function(exports, require, module){

/**
 * dependencies
 */

var matches = require('matches-selector');

/**
 * Traverse with the given `el`, `selector` and `len`.
 *
 * @param {String} type
 * @param {Element} el
 * @param {String} selector
 * @param {Number} len
 * @return {Array}
 * @api public
 */

module.exports = function(type, el, selector, len){
  var el = el[type]
    , n = len || 1
    , ret = [];

  if (!el) return ret;

  do {
    if (n == ret.length) break;
    if (1 != el.nodeType) continue;
    if (matches(el, selector)) ret.push(el);
    if (!selector) ret.push(el);
  } while (el = el[type]);

  return ret;
}

});
require.register("ianstormtaylor-previous-sibling/index.js", function(exports, require, module){

var traverse = require('traverse');


/**
 * Expose `previousSibling`.
 */

module.exports = previousSibling;


/**
 * Get the previous sibling for an `el`.
 *
 * @param {Element} el
 * @param {String} selector (optional)
 */

function previousSibling (el, selector) {
  el = traverse('previousSibling', el, selector)[0];
  return el || null;
}
});
require.register("ianstormtaylor-next-sibling/index.js", function(exports, require, module){

var traverse = require('traverse');


/**
 * Expose `nextSibling`.
 */

module.exports = nextSibling;


/**
 * Get the next sibling for an `el`.
 *
 * @param {Element} el
 * @param {String} selector (optional)
 */

function nextSibling (el, selector) {
  el = traverse('nextSibling', el, selector)[0];
  return el || null;
}
});
require.register("matthewmueller-debounce/index.js", function(exports, require, module){
/**
 * Debounces a function by the given threshold.
 *
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`true`)
 * @api public
 */

module.exports = function debounce(func, threshold, execAsap){
  var timeout;
  if (false !== execAsap) execAsap = true;

  return function debounced(){
    var obj = this, args = arguments;

    function delayed () {
      if (!execAsap) {
        func.apply(obj, args);
      }
      timeout = null;
    }

    if (timeout) {
      clearTimeout(timeout);
    } else if (execAsap) {
      func.apply(obj, args);
    }

    timeout = setTimeout(delayed, threshold || 100);
  };
};

});
require.register("component-set/index.js", function(exports, require, module){

/**
 * Expose `Set`.
 */

module.exports = Set;

/**
 * Initialize a new `Set` with optional `vals`
 *
 * @param {Array} vals
 * @api public
 */

function Set(vals) {
  if (!(this instanceof Set)) return new Set(vals);
  this.vals = [];
  if (vals) {
    for (var i = 0; i < vals.length; ++i) {
      this.add(vals[i]);
    }
  }
}

/**
 * Add `val`.
 *
 * @param {Mixed} val
 * @api public
 */

Set.prototype.add = function(val){
  if (this.has(val)) return;
  this.vals.push(val);
};

/**
 * Check if this set has `val`.
 *
 * @param {Mixed} val
 * @return {Boolean}
 * @api public
 */

Set.prototype.has = function(val){
  return !! ~this.indexOf(val);
};

/**
 * Return the indexof `val`.
 *
 * @param {Mixed} val
 * @return {Number}
 * @api private
 */

Set.prototype.indexOf = function(val){
  for (var i = 0, len = this.vals.length; i < len; ++i) {
    var obj = this.vals[i];
    if (obj.equals && obj.equals(val)) return i;
    if (obj == val) return i;
  }
  return -1;
};

/**
 * Iterate each member and invoke `fn(val)`.
 *
 * @param {Function} fn
 * @return {Set}
 * @api public
 */

Set.prototype.each = function(fn){
  for (var i = 0; i < this.vals.length; ++i) {
    fn(this.vals[i]);
  }
  return this;
};

/**
 * Return the values as an array.
 *
 * @return {Array}
 * @api public
 */

Set.prototype.values =
Set.prototype.array =
Set.prototype.members =
Set.prototype.toJSON = function(){
  return this.vals;
};

/**
 * Return the set size.
 *
 * @return {Number}
 * @api public
 */

Set.prototype.size = function(){
  return this.vals.length;
};

/**
 * Empty the set and return old values.
 *
 * @return {Array}
 * @api public
 */

Set.prototype.clear = function(){
  var old = this.vals;
  this.vals = [];
  return old;
};

/**
 * Remove `val`, returning __true__ when present, otherwise __false__.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api public
 */

Set.prototype.remove = function(val){
  var i = this.indexOf(val);
  if (~i) this.vals.splice(i, 1);
  return !! ~i;
};

/**
 * Perform a union on `set`.
 *
 * @param {Set} set
 * @return {Set} new set
 * @api public
 */

Set.prototype.union = function(set){
  var ret = new Set;
  var a = this.vals;
  var b = set.vals;
  for (var i = 0; i < a.length; ++i) ret.add(a[i]);
  for (var i = 0; i < b.length; ++i) ret.add(b[i]);
  return ret;
};

/**
 * Perform an intersection on `set`.
 *
 * @param {Set} set
 * @return {Set} new set
 * @api public
 */

Set.prototype.intersect = function(set){
  var ret = new Set;
  var a = this.vals;
  var b = set.vals;

  for (var i = 0; i < a.length; ++i) {
    if (set.has(a[i])) {
      ret.add(a[i]);
    }
  }

  for (var i = 0; i < b.length; ++i) {
    if (this.has(b[i])) {
      ret.add(b[i]);
    }
  }

  return ret;
};

/**
 * Check if the set is empty.
 *
 * @return {Boolean}
 * @api public
 */

Set.prototype.isEmpty = function(){
  return 0 == this.vals.length;
};


});
require.register("component-pillbox/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var Emitter = require('emitter')
  , keyname = require('keyname')
  , events = require('events')
  , each = require('each')
  , Set = require('set');

/**
 * Expose `Pillbox`.
 */

module.exports = Pillbox

/**
 * Initialize a `Pillbox` with the given
 * `input` element and `options`.
 *
 * @param {Element} input
 * @param {Object} options
 * @api public
 */

function Pillbox(input, options) {
  if (!(this instanceof Pillbox)) return new Pillbox(input, options);
  var self = this
  this.options = options || {}
  this.input = input;
  this.tags = new Set;
  this.el = document.createElement('div');
  this.el.className = 'pillbox';
  this.el.style = input.style;
  this.ul = document.createElement('ul');
  this.el.appendChild(this.ul);
  input.parentNode.insertBefore(this.el, input);
  input.parentNode.removeChild(input);
  this.el.appendChild(input);
  this.events = events(this.el, this);
  this.bind();
}

/**
 * Mixin emitter.
 */

Emitter(Pillbox.prototype);

/**
 * Bind internal events.
 *
 * @return {Pillbox}
 * @api public
 */

Pillbox.prototype.bind = function(){
  this.events.bind('click');
  this.events.bind('keydown');
  return this;
};

/**
 * Unbind internal events.
 *
 * @return {Pillbox}
 * @api public
 */

Pillbox.prototype.unbind = function(){
  this.events.unbind();
  return this;
};

/**
 * Handle keyup.
 *
 * @api private
 */

Pillbox.prototype.onkeydown = function(e){
  switch (keyname(e.which)) {
    case 'enter':
      e.preventDefault();
      this.add(e.target.value);
      e.target.value = '';
      break;
    case 'space':
      if (!this.options.space) return;
      e.preventDefault();
      this.add(e.target.value);
      e.target.value = '';
      break;
    case 'backspace':
      if ('' == e.target.value) {
        this.remove(this.last());
      }
      break;
  }
};

/**
 * Handle click.
 *
 * @api private
 */

Pillbox.prototype.onclick = function(){
  this.input.focus();
};

/**
 * Set / Get all values.
 *
 * @param {Array} vals
 * @return {Array|Pillbox}
 * @api public
 */

Pillbox.prototype.values = function(vals){
  var self = this;

  if (0 == arguments.length) {
    return this.tags.values();
  }

  each(vals, function(value){
    self.add(value);
  });

  return this;
};

/**
 * Return the last member of the set.
 *
 * @return {String}
 * @api private
 */

Pillbox.prototype.last = function(){
  return this.tags.vals[this.tags.vals.length - 1];
};

/**
 * Add `tag`.
 *
 * @param {String} tag
 * @return {Pillbox} self
 * @api public
 */

Pillbox.prototype.add = function(tag) {
  var self = this
  tag = tag.trim();

  // blank
  if ('' == tag) return;

  // exists
  if (this.tags.has(tag)) return;

  // lowercase
  if (this.options.lowercase) tag = tag.toLowerCase();

  // add it
  this.tags.add(tag);

  // list item
  var li = document.createElement('li');
  li.setAttribute('data', tag);
  li.appendChild(document.createTextNode(tag));
  li.onclick = function(e) {
    e.preventDefault();
    self.input.focus();
  };

  // delete link
  var del = document.createElement('a');
  del.appendChild(document.createTextNode('✕'));
  del.href = '#';
  del.onclick = this.remove.bind(this, tag);
  li.appendChild(del);

  this.ul.appendChild(li);
  this.emit('add', tag);

  return this;
}

/**
 * Remove `tag`.
 *
 * @param {String} tag
 * @return {Pillbox} self
 * @api public
 */

Pillbox.prototype.remove = function(tag) {
  if (!this.tags.has(tag)) return this;
  this.tags.remove(tag);

  var li;
  for (var i = 0; i < this.ul.childNodes.length; ++i) {
    li = this.ul.childNodes[i];
    if (tag == li.getAttribute('data')) break;
  }

  this.ul.removeChild(li);
  this.emit('remove', tag);

  return this;
}


});
require.register("component-indexof/index.js", function(exports, require, module){
module.exports = function(arr, obj){
  if (arr.indexOf) return arr.indexOf(obj);
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) return i;
  }
  return -1;
};
});
require.register("component-emitter/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;

/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return mixin(obj);
};

/**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */

function mixin(obj) {
  for (var key in Emitter.prototype) {
    obj[key] = Emitter.prototype[key];
  }
  return obj;
}

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.on = function(event, fn){
  this._callbacks = this._callbacks || {};
  (this._callbacks[event] = this._callbacks[event] || [])
    .push(fn);
  return this;
};

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.once = function(event, fn){
  var self = this;
  this._callbacks = this._callbacks || {};

  function on() {
    self.off(event, on);
    fn.apply(this, arguments);
  }

  fn._off = on;
  this.on(event, on);
  return this;
};

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */

Emitter.prototype.off =
Emitter.prototype.removeListener =
Emitter.prototype.removeAllListeners = function(event, fn){
  this._callbacks = this._callbacks || {};

  // all
  if (0 == arguments.length) {
    this._callbacks = {};
    return this;
  }

  // specific event
  var callbacks = this._callbacks[event];
  if (!callbacks) return this;

  // remove all handlers
  if (1 == arguments.length) {
    delete this._callbacks[event];
    return this;
  }

  // remove specific handler
  var i = index(callbacks, fn._off || fn);
  if (~i) callbacks.splice(i, 1);
  return this;
};

/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */

Emitter.prototype.emit = function(event){
  this._callbacks = this._callbacks || {};
  var args = [].slice.call(arguments, 1)
    , callbacks = this._callbacks[event];

  if (callbacks) {
    callbacks = callbacks.slice(0);
    for (var i = 0, len = callbacks.length; i < len; ++i) {
      callbacks[i].apply(this, args);
    }
  }

  return this;
};

/**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */

Emitter.prototype.listeners = function(event){
  this._callbacks = this._callbacks || {};
  return this._callbacks[event] || [];
};

/**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */

Emitter.prototype.hasListeners = function(event){
  return !! this.listeners(event).length;
};

});
require.register("component-keyname/index.js", function(exports, require, module){

/**
 * Key name map.
 */

var map = {
  8: 'backspace',
  9: 'tab',
  13: 'enter',
  16: 'shift',
  17: 'ctrl',
  18: 'alt',
  20: 'capslock',
  27: 'esc',
  32: 'space',
  33: 'pageup',
  34: 'pagedown',
  35: 'end',
  36: 'home',
  37: 'left',
  38: 'up',
  39: 'right',
  40: 'down',
  45: 'ins',
  46: 'del',
  91: 'meta',
  93: 'meta',
  224: 'meta'
};

/**
 * Return key name for `n`.
 *
 * @param {Number} n
 * @return {String}
 * @api public
 */

module.exports = function(n){
  return map[n];
};
});
require.register("component-classes/index.js", function(exports, require, module){
/**
 * Module dependencies.
 */

var index = require('indexof');

/**
 * Whitespace regexp.
 */

var re = /\s+/;

/**
 * toString reference.
 */

var toString = Object.prototype.toString;

/**
 * Wrap `el` in a `ClassList`.
 *
 * @param {Element} el
 * @return {ClassList}
 * @api public
 */

module.exports = function(el){
  return new ClassList(el);
};

/**
 * Initialize a new ClassList for `el`.
 *
 * @param {Element} el
 * @api private
 */

function ClassList(el) {
  if (!el) throw new Error('A DOM element reference is required');
  this.el = el;
  this.list = el.classList;
}

/**
 * Add class `name` if not already present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.add = function(name){
  // classList
  if (this.list) {
    this.list.add(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (!~i) arr.push(name);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove class `name` when present, or
 * pass a regular expression to remove
 * any which match.
 *
 * @param {String|RegExp} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.remove = function(name){
  if ('[object RegExp]' == toString.call(name)) {
    return this.removeMatching(name);
  }

  // classList
  if (this.list) {
    this.list.remove(name);
    return this;
  }

  // fallback
  var arr = this.array();
  var i = index(arr, name);
  if (~i) arr.splice(i, 1);
  this.el.className = arr.join(' ');
  return this;
};

/**
 * Remove all classes matching `re`.
 *
 * @param {RegExp} re
 * @return {ClassList}
 * @api private
 */

ClassList.prototype.removeMatching = function(re){
  var arr = this.array();
  for (var i = 0; i < arr.length; i++) {
    if (re.test(arr[i])) {
      this.remove(arr[i]);
    }
  }
  return this;
};

/**
 * Toggle class `name`.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.toggle = function(name){
  // classList
  if (this.list) {
    this.list.toggle(name);
    return this;
  }

  // fallback
  if (this.has(name)) {
    this.remove(name);
  } else {
    this.add(name);
  }
  return this;
};

/**
 * Return an array of classes.
 *
 * @return {Array}
 * @api public
 */

ClassList.prototype.array = function(){
  var str = this.el.className.replace(/^\s+|\s+$/g, '');
  var arr = str.split(re);
  if ('' === arr[0]) arr.shift();
  return arr;
};

/**
 * Check if class `name` is present.
 *
 * @param {String} name
 * @return {ClassList}
 * @api public
 */

ClassList.prototype.has =
ClassList.prototype.contains = function(name){
  return this.list
    ? this.list.contains(name)
    : !! ~index(this.array(), name);
};

});
require.register("component-event/index.js", function(exports, require, module){

/**
 * Bind `el` event `type` to `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, type, fn, capture){
  if (el.addEventListener) {
    el.addEventListener(type, fn, capture);
  } else {
    el.attachEvent('on' + type, fn);
  }
  return fn;
};

/**
 * Unbind `el` event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  if (el.removeEventListener) {
    el.removeEventListener(type, fn, capture);
  } else {
    el.detachEvent('on' + type, fn);
  }
  return fn;
};

});
require.register("component-delegate/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var matches = require('matches-selector')
  , event = require('event');

/**
 * Delegate event `type` to `selector`
 * and invoke `fn(e)`. A callback function
 * is returned which may be passed to `.unbind()`.
 *
 * @param {Element} el
 * @param {String} selector
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @return {Function}
 * @api public
 */

exports.bind = function(el, selector, type, fn, capture){
  return event.bind(el, type, function(e){
    if (matches(e.target, selector)) fn(e);
  }, capture);
  return callback;
};

/**
 * Unbind event `type`'s callback `fn`.
 *
 * @param {Element} el
 * @param {String} type
 * @param {Function} fn
 * @param {Boolean} capture
 * @api public
 */

exports.unbind = function(el, type, fn, capture){
  event.unbind(el, type, fn, capture);
};

});
require.register("component-events/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var events = require('event');
var delegate = require('delegate');

/**
 * Expose `Events`.
 */

module.exports = Events;

/**
 * Initialize an `Events` with the given
 * `el` object which events will be bound to,
 * and the `obj` which will receive method calls.
 *
 * @param {Object} el
 * @param {Object} obj
 * @api public
 */

function Events(el, obj) {
  if (!(this instanceof Events)) return new Events(el, obj);
  if (!el) throw new Error('element required');
  if (!obj) throw new Error('object required');
  this.el = el;
  this.obj = obj;
  this._events = {};
}

/**
 * Subscription helper.
 */

Events.prototype.sub = function(event, method, cb){
  this._events[event] = this._events[event] || {};
  this._events[event][method] = cb;
};

/**
 * Bind to `event` with optional `method` name.
 * When `method` is undefined it becomes `event`
 * with the "on" prefix.
 *
 * Examples:
 *
 *  Direct event handling:
 *
 *    events.bind('click') // implies "onclick"
 *    events.bind('click', 'remove')
 *    events.bind('click', 'sort', 'asc')
 *
 *  Delegated event handling:
 *
 *    events.bind('click li > a')
 *    events.bind('click li > a', 'remove')
 *    events.bind('click a.sort-ascending', 'sort', 'asc')
 *    events.bind('click a.sort-descending', 'sort', 'desc')
 *
 * @param {String} event
 * @param {String|function} [method]
 * @return {Function} callback
 * @api public
 */

Events.prototype.bind = function(event, method){
  var e = parse(event);
  var el = this.el;
  var obj = this.obj;
  var name = e.name;
  var method = method || 'on' + name;
  var args = [].slice.call(arguments, 2);

  // callback
  function cb(){
    var a = [].slice.call(arguments).concat(args);
    obj[method].apply(obj, a);
  }

  // bind
  if (e.selector) {
    cb = delegate.bind(el, e.selector, name, cb);
  } else {
    events.bind(el, name, cb);
  }

  // subscription for unbinding
  this.sub(name, method, cb);

  return cb;
};

/**
 * Unbind a single binding, all bindings for `event`,
 * or all bindings within the manager.
 *
 * Examples:
 *
 *  Unbind direct handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * Unbind delegate handlers:
 *
 *     events.unbind('click', 'remove')
 *     events.unbind('click')
 *     events.unbind()
 *
 * @param {String|Function} [event]
 * @param {String|Function} [method]
 * @api public
 */

Events.prototype.unbind = function(event, method){
  if (0 == arguments.length) return this.unbindAll();
  if (1 == arguments.length) return this.unbindAllOf(event);

  // no bindings for this event
  var bindings = this._events[event];
  if (!bindings) return;

  // no bindings for this method
  var cb = bindings[method];
  if (!cb) return;

  events.unbind(this.el, event, cb);
};

/**
 * Unbind all events.
 *
 * @api private
 */

Events.prototype.unbindAll = function(){
  for (var event in this._events) {
    this.unbindAllOf(event);
  }
};

/**
 * Unbind all events for `event`.
 *
 * @param {String} event
 * @api private
 */

Events.prototype.unbindAllOf = function(event){
  var bindings = this._events[event];
  if (!bindings) return;

  for (var method in bindings) {
    this.unbind(event, method);
  }
};

/**
 * Parse `event`.
 *
 * @param {String} event
 * @return {Object}
 * @api private
 */

function parse(event) {
  var parts = event.split(/ +/);
  return {
    name: parts.shift(),
    selector: parts.join(' ')
  }
}

});
require.register("component-domify/index.js", function(exports, require, module){

/**
 * Expose `parse`.
 */

module.exports = parse;

/**
 * Wrap map from jquery.
 */

var map = {
  option: [1, '<select multiple="multiple">', '</select>'],
  optgroup: [1, '<select multiple="multiple">', '</select>'],
  legend: [1, '<fieldset>', '</fieldset>'],
  thead: [1, '<table>', '</table>'],
  tbody: [1, '<table>', '</table>'],
  tfoot: [1, '<table>', '</table>'],
  colgroup: [1, '<table>', '</table>'],
  caption: [1, '<table>', '</table>'],
  tr: [2, '<table><tbody>', '</tbody></table>'],
  td: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  th: [3, '<table><tbody><tr>', '</tr></tbody></table>'],
  col: [2, '<table><tbody></tbody><colgroup>', '</colgroup></table>'],
  _default: [0, '', '']
};

/**
 * Parse `html` and return the children.
 *
 * @param {String} html
 * @return {Array}
 * @api private
 */

function parse(html) {
  if ('string' != typeof html) throw new TypeError('String expected');

  // tag name
  var m = /<([\w:]+)/.exec(html);
  if (!m) throw new Error('No elements were generated.');
  var tag = m[1];

  // body support
  if (tag == 'body') {
    var el = document.createElement('html');
    el.innerHTML = html;
    return el.removeChild(el.lastChild);
  }

  // wrap map
  var wrap = map[tag] || map._default;
  var depth = wrap[0];
  var prefix = wrap[1];
  var suffix = wrap[2];
  var el = document.createElement('div');
  el.innerHTML = prefix + html + suffix;
  while (depth--) el = el.lastChild;

  var els = el.children;
  if (1 == els.length) {
    return el.removeChild(els[0]);
  }

  var fragment = document.createDocumentFragment();
  while (els.length) {
    fragment.appendChild(el.removeChild(els[0]));
  }

  return fragment;
}

});
require.register("component-query/index.js", function(exports, require, module){

function one(selector, el) {
  return el.querySelector(selector);
}

exports = module.exports = function(selector, el){
  el = el || document;
  return one(selector, el);
};

exports.all = function(selector, el){
  el = el || document;
  return el.querySelectorAll(selector);
};

exports.engine = function(obj){
  if (!obj.one) throw new Error('.one callback required');
  if (!obj.all) throw new Error('.all callback required');
  one = obj.one;
  exports.all = obj.all;
};

});
require.register("component-to-function/index.js", function(exports, require, module){

/**
 * Expose `toFunction()`.
 */

module.exports = toFunction;

/**
 * Convert `obj` to a `Function`.
 *
 * @param {Mixed} obj
 * @return {Function}
 * @api private
 */

function toFunction(obj) {
  switch ({}.toString.call(obj)) {
    case '[object Object]':
      return objectToFunction(obj);
    case '[object Function]':
      return obj;
    case '[object String]':
      return stringToFunction(obj);
    case '[object RegExp]':
      return regexpToFunction(obj);
    default:
      return defaultToFunction(obj);
  }
}

/**
 * Default to strict equality.
 *
 * @param {Mixed} val
 * @return {Function}
 * @api private
 */

function defaultToFunction(val) {
  return function(obj){
    return val === obj;
  }
}

/**
 * Convert `re` to a function.
 *
 * @param {RegExp} re
 * @return {Function}
 * @api private
 */

function regexpToFunction(re) {
  return function(obj){
    return re.test(obj);
  }
}

/**
 * Convert property `str` to a function.
 *
 * @param {String} str
 * @return {Function}
 * @api private
 */

function stringToFunction(str) {
  // immediate such as "> 20"
  if (/^ *\W+/.test(str)) return new Function('_', 'return _ ' + str);

  // properties such as "name.first" or "age > 18"
  return new Function('_', 'return _.' + str);
}

/**
 * Convert `object` to a function.
 *
 * @param {Object} object
 * @return {Function}
 * @api private
 */

function objectToFunction(obj) {
  var match = {}
  for (var key in obj) {
    match[key] = typeof obj[key] === 'string'
      ? defaultToFunction(obj[key])
      : toFunction(obj[key])
  }
  return function(val){
    if (typeof val !== 'object') return false;
    for (var key in match) {
      if (!(key in val)) return false;
      if (!match[key](val[key])) return false;
    }
    return true;
  }
}

});
require.register("component-type/index.js", function(exports, require, module){

/**
 * toString ref.
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 *
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

module.exports = function(val){
  switch (toString.call(val)) {
    case '[object Function]': return 'function';
    case '[object Date]': return 'date';
    case '[object RegExp]': return 'regexp';
    case '[object Arguments]': return 'arguments';
    case '[object Array]': return 'array';
    case '[object String]': return 'string';
  }

  if (val === null) return 'null';
  if (val === undefined) return 'undefined';
  if (val && val.nodeType === 1) return 'element';
  if (val === Object(val)) return 'object';

  return typeof val;
};

});
require.register("component-each/index.js", function(exports, require, module){

/**
 * Module dependencies.
 */

var toFunction = require('to-function');
var type;

try {
  type = require('type-component');
} catch (e) {
  type = require('type');
}

/**
 * HOP reference.
 */

var has = Object.prototype.hasOwnProperty;

/**
 * Iterate the given `obj` and invoke `fn(val, i)`.
 *
 * @param {String|Array|Object} obj
 * @param {Function} fn
 * @api public
 */

module.exports = function(obj, fn){
  fn = toFunction(fn);
  switch (type(obj)) {
    case 'array':
      return array(obj, fn);
    case 'object':
      if ('number' == typeof obj.length) return array(obj, fn);
      return object(obj, fn);
    case 'string':
      return string(obj, fn);
  }
};

/**
 * Iterate string chars.
 *
 * @param {String} obj
 * @param {Function} fn
 * @api private
 */

function string(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj.charAt(i), i);
  }
}

/**
 * Iterate object keys.
 *
 * @param {Object} obj
 * @param {Function} fn
 * @api private
 */

function object(obj, fn) {
  for (var key in obj) {
    if (has.call(obj, key)) {
      fn(key, obj[key]);
    }
  }
}

/**
 * Iterate array-ish.
 *
 * @param {Array|Object} obj
 * @param {Function} fn
 * @api private
 */

function array(obj, fn) {
  for (var i = 0; i < obj.length; ++i) {
    fn(obj[i], i);
  }
}

});
require.register("yields-select/index.js", function(exports, require, module){

/**
 * dependencies
 */

var previous = require('previous-sibling');
var template = require('./template.html');
var next = require('next-sibling');
var debounce = require('debounce');
var Pillbox = require('pillbox');
var classes = require('classes');
var Emitter = require('emitter');
var keyname = require('keyname');
var events = require('events');
var domify = require('domify');
var query = require('query');
var each = require('each');
var tpl = domify(template);

/**
 * Export `Select`
 */

module.exports = Select;

/**
 * Initialize `Select`.
 *
 * @api public
 */

function Select(){
  if (!(this instanceof Select)) return new Select;
  this.el = tpl.cloneNode(true);
  this.classes = classes(this.el);
  this.opts = query('.select-options', this.el);
  this.dropdown = query('.select-dropdown', this.el);
  this.input = query('.select-input', this.el);
  this.inputEvents = events(this.input, this);
  this.events = events(this.el, this);
  this._selected = [];
  this.options = {};
  this.bind();
}

/**
 * Mixins.
 */

Emitter(Select.prototype);

/**
 * Bind internal events.
 *
 * @return {Select}
 * @api private
 */

Select.prototype.bind = function(){
  this.events.bind('click .select-box', 'focus');
  this.events.bind('mousedown .select-option');
  this.events.bind('mouseover .select-option');
  var onsearch = this.onsearch.bind(this);
  this.input.oninput = debounce(onsearch, 300);
  this.inputEvents.bind('focus', 'show');
  this.inputEvents.bind('blur');
  this.events.bind('keydown');
  return this;
};

/**
 * Set the select label.
 *
 * @param {String} label
 * @return {Select}
 * @api public
 */

Select.prototype.label = function(label){
  this._label = label;
  this.input.placeholder = label;
  return this;
};

/**
 * Allow multiple.
 *
 * @param {String} label
 * @param {Object} opts
 * @return {Select}
 * @api public
 */

Select.prototype.multiple = function(label, opts){
  if (this._multiple) return;
  this._multiple = true;
  this.classes.remove('select-single');
  this.box = new Pillbox(this.input, opts);
  this.box.events.unbind('keydown');
  this.box.on('remove', this.deselect.bind(this));
  return this;
};

/**
 * Add an option with `name` and `value`.
 *
 * @param {String|Object} name
 * @param {Mixed} value
 * @return {Select}
 * @api public
 */

Select.prototype.add = function(name, value){
  var opt = option.apply(null, arguments);
  this.opts.appendChild(opt.el);
  this.options[opt.name] = opt;
  this.emit('add', opt);
  return this;
};

/**
 * Remove an option with `name`.
 *
 * @param {String} name
 * @return {Select}
 * @api public
 */

Select.prototype.remove = function(name){
  name = name.toLowerCase();
  var opt = this.get(name);
  this.emit('remove', opt);
  this.opts.removeChild(opt.el);

  // selected
  if (opt.selected) {
    var i = this._selected.indexOf(opt);
    this._selected.splice(i, 1);
  }

  delete this.options[name];

  return this;
};

/**
 * Select `name`.
 *
 * @param {String} name
 * @return {Select}
 * @api public
 */

Select.prototype.select = function(name){
  var opt = this.get(name);

  // state
  if (!this.classes.has('selected')) {
    this.classes.add('selected');
  }

  // select
  this.emit('select', opt);
  opt.selected = true;

  // hide
  opt.el.setAttribute('hidden', '');
  classes(opt.el).add('selected');

  // multiple
  if (this._multiple) {
    this.box.add(opt.label);
    this._selected.push(opt);
    this.input.value = '';
    this.dehighlight();
    this.change();
    this.hide();
    return this;
  }

  // single
  var prev = this._selected[0];
  if (prev) this.deselect(prev.name);
  this._selected = [opt];
  this.input.value = opt.label;
  this.hide();
  this.change();
  return this;
};

/**
 * Deselect `name`.
 *
 * @param {String} name
 * @return {Select}
 * @api public
 */

Select.prototype.deselect = function(name){
  var opt = this.get(name);

  // deselect
  this.emit('deselect', opt);
  opt.selected = false;

  // show
  opt.el.removeAttribute('hidden');
  classes(opt.el).remove('selected');

  // multiple
  if (this._multiple) {
    this.box.remove(name);
    var i = this._selected.indexOf(opt);
    if (!~i) return this;
    this._selected.splice(i, 1);
    this.change();
    return this;
  }

  // deselect
  this.classes.remove('selected');

  // single
  this.label(this._label);
  this._selected = [];
  this.change();
  return this;
};

/**
 * Get an option `name` or dropdown.
 *
 * @param {String} name
 * @return {Element}
 * @api public
 */

Select.prototype.get = function(name){
  if ('string' == typeof name) {
    name = name.toLowerCase();
    var opt = this.options[name];
    if (!opt) throw new Error('option "' + name + '" does not exist');
    return opt;
  }

  return { el: this.dropdown };
};

/**
 * Show options or `name`
 *
 * @param {String} name
 * @return {Select}
 * @api public
 */

Select.prototype.show = function(name){
  var opt = this.get(name);

  // visible
  if (this.visible(name)) return this;

  // show
  opt.el.removeAttribute('hidden');

  // focus
  if (!this._multiple && !this._searchable) {
    this.el.focus();
  }

  // option
  if ('string' == typeof name) return this;

  // show
  this.emit('show');
  this.classes.add('open');

  // highlight
  var el = query('.select-option:not([hidden]):not(.selected)', this.opts);
  if (el) this.highlight(el);

  return this;
};

/**
 * Hide options or `name`.
 *
 * @param {String} name
 * @return {Select}
 * @api public
 */

Select.prototype.hide = function(name){
  var opt = this.get(name);
  opt.el.setAttribute('hidden', '');
  if ('string' == typeof name) return this;
  this.emit('hide');
  this.classes.remove('open');
  this.showAll();
  return this;
};

/**
 * Check if options or `name` is visible.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

Select.prototype.visible = function(name){
  return ! this.get(name).el.hasAttribute('hidden');
};

/**
 * Toggle show / hide with optional `name`.
 *
 * @param {String} name
 * @return {Select}
 * @api public
 */

Select.prototype.toggle = function(name){
  if ('string' != typeof name) name = null;

  return this.visible(name)
    ? this.hide(name)
    : this.show(name);
};

/**
 * Disable `name`.
 *
 * @param {String} name
 * @return {Select}
 * @api public
 */

Select.prototype.disable = function(name){
  var opt = this.get(name);
  opt.el.setAttribute('disabled', true);
  opt.disabled = true;
  return this;
};

/**
 * Enable `name`.
 *
 * @param {String} name
 * @return {Select}
 * @api public
 */

Select.prototype.enable = function(name){
  var opt = this.get(name);
  opt.el.removeAttribute('disabled');
  opt.disabled = false;
  return this;
};

/**
 * Set / get the selected options.
 *
 * @param {Array} opts
 * @return {Select}
 * @api public
 */

Select.prototype.selected = function(arr){
  if (1 == arguments.length) {
    arr.forEach(this.select, this);
    return this;
  }

  return this._selected;
};

/**
 * Get the values.
 *
 * @return {Array}
 * @api public
 */

Select.prototype.values = function(){
  return this._selected.map(function(opt){
    return opt.value;
  });
};

/**
 * Search `term`.
 *
 * @param {String} term
 * @return {Search}
 * @api public
 */

Select.prototype.search = function(term){
  var expr = term.toLowerCase()
    , opts = this.options
    , self = this
    , found = 0;

  // custom search
  this.emit('search', term, opts);

  // abort
  if (this.hasListeners('search')) return this;

  // search
  each(opts, function(name, opt){
    if (opt.disabled) return;
    if (opt.selected) return;

    if (~name.indexOf(expr)) {
      self.show(name);
      if (1 == ++found) self.highlight(opt.el);
    } else {
      self.hide(opt.name);
    }
  });

  // all done
  return this.emit('found', found);
};

/**
 * Highlight the given `name`.
 *
 * @param {String|Element} el
 * @return {Select}
 * @api private
 */

Select.prototype.highlight = function(el){
  if ('string' == typeof el) el = this.get(el).el;
  this.dehighlight();
  classes(el).add('highlight');
  this.active = el;
  return this;
};

/**
 * De-highlight.
 *
 * @return {Select}
 * @api public
 */

Select.prototype.dehighlight = function(){
  if (!this.active) return this;
  classes(this.active).remove('highlight');
  this.active = null;
  return this;
};

/**
 * Focus input.
 *
 * @return {Select}
 * @api public
 */

Select.prototype.focus = function(){
  this.input.focus();
  return this;
};

/**
 * Highlight next element.
 *
 * @api private
 */

Select.prototype.next = function(){
  if (!this.active) return;
  var el = next(this.active, ':not([hidden]):not(.selected)');
  el = el || query('.select-option:not([hidden])', this.opts);
  if (el) this.highlight(el);
};

/**
 * Highlight previous element.
 *
 * @api private
 */

Select.prototype.previous = function(){
  if (!this.active) return;
  var el = previous(this.active, ':not([hidden]):not(.selected)');
  el = el || query.all('.select-option:not([hidden])', this.el);
  if (el.length) el = el[el.length - 1];
  if (el.className) this.highlight(el);
};

/**
 * on-input
 *
 * @param {Event} e
 * @api private
 */

Select.prototype.onsearch = function(e){
  if (e.target.value) {
    this.search(e.target.value);
  } else {
    this.showAll();
  }
};

/**
 * on-keydown.
 *
 * @param {Event} e
 * @api private
 */

Select.prototype.onkeydown = function(e){
  var multi = this._multiple
    , visible = this.visible()
    , active = this.active
    , box = this.box;

  // actions
  switch (keyname(e.which)) {
    case 'down':
      e.preventDefault();
      visible
        ? this.next()
        : this.show();
      break;
    case 'up':
      e.preventDefault();
      visible
        ? this.previous()
        : this.show();
      break;
    case 'esc':
      this.hide();
      this.input.value = '';
      break;
    case 'enter':
      if (!this.active || !visible) return;
      var name = this.active.getAttribute('data-name');
      this.select(name);
      break;
    case 'backspace':
      if (box) return box.onkeydown(e);
      var all = this._selected;
      var item = all[all.length - 1];
      if (!item) return;
      this.deselect(item.name);
      break;
  }
};

/**
 * on-mousedown.
 *
 * @param {Event} e
 * @api private
 */

Select.prototype.onmousedown = function(e){
  var name = e.target.getAttribute('data-name');
  this.select(name);
};

/**
 * on-mouseover
 *
 * @param {Event} e
 * @api private
 */

Select.prototype.onmouseover = function(e){
  var name = e.target.getAttribute('data-name');
  this.highlight(name);
};

/**
 * Emit change.
 *
 * @api private
 */

Select.prototype.change = function(){
  this.emit('change', this);
};

/**
 * on-blur.
 *
 * @param {Event} e
 * @api public
 */

Select.prototype.onblur = function(e){
  this.showAll();
  this.hide();

  if (this._multiple) {
    this.input.value = '';
  } else if (!this._selected.length) {
    this.input.value = '';
  }
};

/**
 * Show all options.
 *
 * @return {Select}
 * @api private
 */

Select.prototype.showAll = function(){
  var els = query.all('[hidden]:not(.selected)', this.opts);

  for (var i = 0; i < els.length; ++i) {
    els[i].removeAttribute('hidden');
  }

  return this;
};

/**
 * Create an option.
 *
 * @param {String|Object} obj
 * @param {Mixed} value
 * @param {Element} el
 * @return {Object}
 * @api private
 */

function option(obj, value, el){
  if ('string' == typeof obj) {
    return option({
      value: value,
      name: obj,
      el: el
    });
  }

  // option
  obj.label = obj.name;
  obj.name = obj.name.toLowerCase();
  obj.value = obj.value || obj.name;

  // element
  if (!obj.el) {
    obj.el = document.createElement('li');
    obj.el.textContent = obj.label;
  }

  // domify
  if ('string' == typeof obj.el) {
    obj.el = domify(obj.el);
  }

  // setup element
  obj.el.setAttribute('data-name', obj.name);
  classes(obj.el).add('select-option');
  classes(obj.el).add('show');

  // opt
  return obj;
}

});













require.register("yields-select/template.html", function(exports, require, module){
module.exports = '<div class=\'select select-single\'>\n  <div class=\'select-box\'>\n    <input type=\'text\' class=\'select-input\'>\n  </div>\n  <div class=\'select-dropdown\' hidden>\n    <ul class=\'select-options\'></ul>\n  </div>\n</div>\n';
});
require.alias("yields-select/index.js", "select-demo/deps/select/index.js");
require.alias("yields-select/index.js", "select-demo/deps/select/index.js");
require.alias("yields-select/index.js", "select/index.js");
require.alias("ianstormtaylor-previous-sibling/index.js", "yields-select/deps/previous-sibling/index.js");
require.alias("yields-traverse/index.js", "ianstormtaylor-previous-sibling/deps/traverse/index.js");
require.alias("yields-traverse/index.js", "ianstormtaylor-previous-sibling/deps/traverse/index.js");
require.alias("component-matches-selector/index.js", "yields-traverse/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "yields-traverse/index.js");
require.alias("ianstormtaylor-next-sibling/index.js", "yields-select/deps/next-sibling/index.js");
require.alias("yields-traverse/index.js", "ianstormtaylor-next-sibling/deps/traverse/index.js");
require.alias("yields-traverse/index.js", "ianstormtaylor-next-sibling/deps/traverse/index.js");
require.alias("component-matches-selector/index.js", "yields-traverse/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("yields-traverse/index.js", "yields-traverse/index.js");
require.alias("matthewmueller-debounce/index.js", "yields-select/deps/debounce/index.js");

require.alias("component-pillbox/index.js", "yields-select/deps/pillbox/index.js");
require.alias("component-events/index.js", "component-pillbox/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-keyname/index.js", "component-pillbox/deps/keyname/index.js");

require.alias("component-emitter/index.js", "component-pillbox/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-each/index.js", "component-pillbox/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("component-set/index.js", "component-pillbox/deps/set/index.js");

require.alias("component-emitter/index.js", "yields-select/deps/emitter/index.js");
require.alias("component-indexof/index.js", "component-emitter/deps/indexof/index.js");

require.alias("component-keyname/index.js", "yields-select/deps/keyname/index.js");

require.alias("component-classes/index.js", "yields-select/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("component-events/index.js", "yields-select/deps/events/index.js");
require.alias("component-event/index.js", "component-events/deps/event/index.js");

require.alias("component-delegate/index.js", "component-events/deps/delegate/index.js");
require.alias("component-matches-selector/index.js", "component-delegate/deps/matches-selector/index.js");
require.alias("component-query/index.js", "component-matches-selector/deps/query/index.js");

require.alias("component-event/index.js", "component-delegate/deps/event/index.js");

require.alias("component-domify/index.js", "yields-select/deps/domify/index.js");

require.alias("component-query/index.js", "yields-select/deps/query/index.js");

require.alias("component-each/index.js", "yields-select/deps/each/index.js");
require.alias("component-to-function/index.js", "component-each/deps/to-function/index.js");

require.alias("component-type/index.js", "component-each/deps/type/index.js");

require.alias("yields-select/index.js", "yields-select/index.js");