
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
  this.events.bind('click .select-box', 'toggle');
  this.events.bind('click .select-label', 'toggle');
  this.events.bind('click .select-option');
  this.events.bind('keydown');
  this.events.bind('keyup');
  this.events.bind('blur');
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
  var el = this.input = search(this, label);
  var box = query('.select-box', this.el);
  box.innerHTML = '';
  box.appendChild(el);
  this.box = new Pillbox(el, opts);
  this.box.events.unbind('keydown');
  this.box.on('remove', this.deselect.bind(this));
  el.onfocus = this.show.bind(this);
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
  var el = this.input = search(this, label);
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
 * Remove an option with `name`.
 *
 * @param {String} name
 * @return {Select}
 * @api public
 */

Select.prototype.remove = function(name){
  var name = name.toLowerCase()
    , opts = this.options
    , len = opts.length
    , j;

  for (var i = 0; i < len; ++i) {
    if (name == opts[i].name) {
      this.emit('remove', opts[i]);
      this.opts.removeChild(opts[i].el);

      // selected
      if (opts[i].selected) {
        j = this._selected.indexOf(opts[0]);
        this._selected.splice(j, 1);
      }

      opts.splice(i, 1);
      break;
    }
  }

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
    this.box.add(name);
    this._selected.push(opt);
    this.box.input.value = '';
    this.change();
    this.hide();
    return this;
  }

  // single
  var prev = this._selected[0];
  if (prev) this.deselect(prev.name);
  this._selected = [opt];
  this.label(name);
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
    var i = this.indexOf(name);
    var opt = this.options[i];
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
  console.log('show');

  // focus
  if (!this._multiple && !this._searchable) {
    this.el.focus();
  }

  // option
  if ('string' == typeof name) return this;

  // show
  this.emit('show');
  this.classes.add('opened');

  // highlight first.
  var el = query(':not([disabled]):not(.selected)', this.opts);
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
    , len = opts.length
    , found = 0
    , i = 0
    , name;

  // custom search
  this.emit('search', term, opts);

  // abort
  if (this.hasListeners('search')) return this;

  // search
  for (var i = 0; i < len; ++i) {
    var opt = opts[i];

    // Ignore.
    if (opt.disabled) continue;
    if (opt.selected) continue;

    if (~opt.name.indexOf(expr)) {
      this.show(opt.name);
      if (1 == ++found) this.highlight(opt.el);
    } else {
      this.hide(opt.name);
    }
  }

  // all done
  return this.emit('found', found);
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
 * @param {String} el
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
  el = el || query(':not([hidden]):not(.selected)', this.opts);
  this.highlight(el);
};

/**
 * Highlight previous element.
 *
 * @api private
 */

Select.prototype.previous = function(){
  var el = prev(this.curr, ':not([hidden]):not(.selected)');
  el = el || query(':not([hidden]):not(.selected)');
  this.highlight(el);
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
 * on-blur.
 *
 * @param {Event} e
 * @api private
 */

Select.prototype.onblur = function(e){
  if (this.input) return;
  this.hide();
};

/**
 * on-keyup.
 *
 * @param {Event} e
 * @api private
 */

Select.prototype.onkeyup = function(e){
  switch (keyname(e.which)) {
    case 'esc': return this.hide();
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
  obj.value = obj.value || obj.name.toLowerCase();
  obj.el.textContent = obj.name;
  obj.name = obj.name.toLowerCase();
  return obj;
}

/**
 * Get a search input.
 *
 * @param {Select} select
 * @param {String} label
 * @return {Element}
 * @api private
 */

function search(select, label){
  var el = document.createElement('input');
  label = label || select._label;
  el.type = 'text';
  el.placeholder = label;

  // blur
  el.onblur = function(){
    el.value = '';
    setTimeout(function(){
      select.hide();
    }, 50);
  };

  // search
  el.oninput = throttle(function(){
    select.search(el.value);
  }, 300);

  // hide
  select.on('hide', function(){
    el.value = '';
    var els = query.all('[hidden]:not(.selected)', select.opts);
    for (var i = 0; i < els.length; ++i) {
      els[i].removeAttribute('hidden');
    }
  });

  return el;
}
