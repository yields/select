
/**
 * dependencies
 */

var template = require('./template')
  , prev = require('previous-sibling')
  , next = require('next-sibling')
  , Pillbox = require('pillbox')
  , classes = require('classes')
  , Emitter = require('emitter')
  , keyname = require('keyname')
  , events = require('events')
  , domify = require('domify')
  , query = require('query')
  , tpl = domify(template);

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
  this.events = events(this.el, this);
  this._selected = [];
  this.options = [];
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
  this.events.bind('click .select-label', 'toggle');
  this.events.bind('click .select-box', 'toggle');
  this.events.bind('click .select-option');
  this.events.bind('focusin input', 'show');
  this.events.bind('blur', 'hide');
  this.events.bind('search input');
  this.events.bind('keydown');
  this.events.bind('keyup');
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
  query('.select-label', this.el).textContent = label;
  this._label = label;
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
  var el = document.createElement('input');
  label = label || this._label;
  el.placeholder = label;
  el.type = 'search';
  el.incremental = true;
  el.onblur = this.hide.bind(this);
  var box = query('.select-box', this.el);
  box.innerHTML = '';
  box.appendChild(el);
  this.box = new Pillbox(el, opts);
  this.box.events.unbind('keydown');
  this.box.on('remove', this.deselect.bind(this));
  return this;
};

/**
 * Make it searchable.
 *
 * @param {String} label
 * @return {Select}
 * @api public
 */

Select.prototype.searchable = function(label){
  if (this._searchable) return this;
  this._searchable = true;
  var el = document.createElement('input');
  label = label || this._label;
  el.type = 'search';
  el.incremental = true;
  el.placeholder = label;
  el.onblur = this.hide.bind(this);
  this.dropdown.insertBefore(el, this.opts);
  this.on('show', el.focus.bind(el));
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
  this.options.push(opt);
  this.emit('add', opt);
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
  this.classes.add('selected');

  // hide
  opt.setAttribute('hidden', '');
  classes(opt).add('selected');

  // multiple
  if (this._multiple) {
    this.box.add(name);
    this._selected = this.box.values();
    this.emit('select', opt);
    this.box.input.value = '';
    this.change();
    this.hide();
    return this;
  }

  var prev = this._selected[0];
  if (prev) this.deselect(prev);
  this._selected = [name];
  this.label(name);
  this.hide();
  this.emit('select', opt);
  this.change();
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
  this.emit('deselect', opt);

  // show
  opt.removeAttribute('hidden');
  classes(opt).remove('selected');

  // multiple
  if (this._multiple) {
    this.box.remove(name);
    this._selected = this.box.values();
    this.change();
    return this;
  }

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
    var i = this.indexOf(name);
    var opt = this.options[i];
    if (!opt) throw new Error('option "' + name + '" does not exist');
    return opt.el;
  }

  return this.dropdown;
};

/**
 * Show options or `name`
 *
 * @param {String} name
 * @return {Select}
 * @api public
 */

Select.prototype.show = function(name){
  var el = this.get(name);
  el.removeAttribute('hidden');

  // focus
  if (!this._multiple && !this._searchable) {
    this.el.focus();
  }

  if ('string' == typeof name) return this;
  this.emit('show');
  this.classes.add('opened');
  var opt = this.options[0];
  if (opt) this.highlight(opt.el);
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
  var el = this.get(name);
  el.setAttribute('hidden', '');
  if (name) return this;
  this.emit('hide');
  this.classes.remove('opened');
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
  return ! this.get(name).hasAttribute('hidden');
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
  this.get(name).setAttribute('disabled', true);
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
  this.get(name).removeAttribute('disabled');
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
    arr.forEach(this.select.bind(this));
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
    , len = opts.length
    , found = 0
    , i = 0
    , name;

  // custom search
  this.emit('search', term, opts);
  if (this.hasListeners('search')) return;

  // search
  for (var i = 0; i < len; ++i) {
    var opt = opts[i];
    if (~opt.name.indexOf(expr)) {
      this.show(opt.name);
      if (1 == ++found) this.highlight(opt.el);
    } else {
      this.hide(opt.name);
    }
  }

  // all done
  this.emit('found', found);

  return this;
};


/**
 * Get indexof `name`.
 *
 * @return {Number}
 * @api private
 */

Select.prototype.indexOf = function(name){
  var name = name.toLowerCase()
    , all = this.options
    , len = all.length;

  for (var i = 0; i < len; ++i) {
    if (name == all[i].name) return i;
  }

  return -1;
};

/**
 * Highlight the given `el`.
 *
 * @param {Element} el
 * @api private
 */

Select.prototype.highlight = function(el){
  var curr = this.curr;
  if (curr) classes(curr).remove('highlight');
  classes(el).add('highlight');
  this.curr = el;
};

/**
 * Highlight next element.
 *
 * @api private
 */

Select.prototype.next = function(){
  var el = next(this.curr, ':not([hidden]):not(.selected)');
  this.highlight(el || this.opts.firstChild);
};

/**
 * Highlight previous element.
 *
 * @api private
 */

Select.prototype.previous = function(){
  var el = prev(this.curr, ':not([hidden]):not(.selected)');
  this.highlight(el || this.opts.lastChild);
};

/**
 * on-click.
 *
 * @param {Event} e
 * @api private
 */

Select.prototype.onclick = function(e){
  this.select(e.target.textContent);
};

/**
 * on-input
 *
 * @param {Event} e
 * @api private
 */

Select.prototype.onsearch = function(e){
  this.search(e.target.value);
};

/**
 * on-keydown.
 *
 * @param {Event} e
 * @api private
 */

Select.prototype.onkeydown = function(e){
  if (!this.visible()) this.show();

  if (!this.curr || 13 != e.which) {
    if (this.box) return this.box.onkeydown(e);
    return;
  }

  e.preventDefault();
  this.select(this.curr.textContent);
};

/**
 * on-keyup.
 *
 * @param {Event} e
 * @api private
 */

Select.prototype.onkeyup = function(e){
  switch (keyname(e.which)) {
    case 'down': return this.next();
    case 'up': return this.previous();
  }
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

  obj.el = obj.el || document.createElement('li');
  classes(obj.el).add('select-option');
  classes(obj.el).add('show');
  obj.value = obj.value;
  obj.el.textContent = obj.name;
  obj.name = obj.name.toLowerCase();
  return obj;
}
