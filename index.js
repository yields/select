
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
  var el = search(this, label);
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
  var el = search(this, label);
  this.dropdown.insertBefore(el, this.opts);
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
  this.get(name).el.setAttribute('disabled', true);
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
  this.get(name).el.removeAttribute('disabled');
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
  el.type = 'search';
  el.placeholder = label;
  el.incremental = true;

  // blur
  el.onblur = function(){
    setTimeout(function(){
      select.hide();
    }, 50);
  };

  // show
  select.on('show', function(){
    el.focus();
    el.value = '';
  });

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
