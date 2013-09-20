
/**
 * dependencies
 */

var previous = require('previous-sibling');
var template = require('./template');
var next = require('next-sibling');
var throttle = require('throttle');
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
  var onsearch = this.onsearch.bind(this);
  this.input.oninput = throttle(onsearch, 300);
  this.inputEvents.bind('focus', 'show');
  this.inputEvents.bind('blur');
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

  // highlight first.
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
  var el = next(this.active, ':not([hidden]):not(.selected)');
  el = el || query('.select-option:not([hidden])', this.opts);
  this.highlight(el);
};

/**
 * Highlight previous element.
 *
 * @api private
 */

Select.prototype.previous = function(){
  var el = previous(this.active, ':not([hidden]):not(.selected)');
  el = el || query.all('.select-option:not([hidden])', this.el);
  if (el.length) el = el[el.length - 1];
  this.highlight(el);
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
  if (!this.active || 13 != e.which) {
    if (this.box) this.box.onkeydown(e);
    return;
  }

  var name = this.active.getAttribute('data-name');
  e.preventDefault();
  this.select(name);
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
 * on-keyup.
 *
 * @param {Event} e
 * @api private
 */

Select.prototype.onkeyup = function(e){
  switch (keyname(e.which)) {
    case 'down':
      this.next();
      break;
    case 'up':
      this.previous();
      break;
    case 'esc':
      this.hide();
      this.input.value = '';
      break;
    case 'enter':
      break;
    case 'backspace':
      if (this._multiple) return;
      if (!this._selected.length) return;
      this.deselect(this._selected[0].name);
      break;
    default:
      this.show();
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
