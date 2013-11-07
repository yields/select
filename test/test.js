
var dom = require('dom');
var Pillbox = require('pillbox');
var select = require('select');
var assert = require('assert');

describe('select()', function(){
  describe('.label(label)', function(){
    it('should set the label', function(){
      var s = select().label('label');
      assert('label' == dom('.select-input', s.el).placeholder());
    })
  })

  describe('.multiple()', function(){
    var s;

    before(function(){
      s = select().multiple();
    })

    it('should set ._multiple to `true`', function(){
      assert(true == s._multiple);
    })

    it('should create `pillbox` and set it to `.box`', function(){
      assert(s.box instanceof Pillbox);
    })

    it('should append the pillbox to `.select-box`', function(){
      assert(dom('.pillbox', s.el).length());
    })
  })

  describe('.add(name[, value])', function(){
    var s = select();

    it('should add to `.options`', function(){
      assert(!s.options.one);
      s.add('one', 'two');
      assert(s.options.one);
    })

    it('should create a correct option object', function(){
      var opt = s.options.one;
      assert('one' == opt.name);
      assert('two' == opt.value);
      assert('one' == dom(opt.el).text());
    })

    it('should emit `add` with the option', function(){
      var opt;
      s.on('add', function(o){ opt = o; });
      s.add('foo')
      assert('foo' == opt.name);
      assert('foo' == opt.value);
    })
  })

  describe('.remove(name)', function(){
    var s = select();

    it('should remove it from .options', function(){
      s.add('a');
      assert(s.options.a);
      s.remove('a');
      assert(!s.options.a);
    })

    it('should remove it from ._selected if its selected', function(){
      s.add('a')
      assert(s.options.a);
      s.select('a');
      assert(1 == s.selected().length);
      s.remove('a');
      assert(!s.options.a);
      assert(0 == s.selected().length);
    })

    it('should emit `remove` with the option', function(){
      var opt;
      s.add('a');
      s.on('remove', function(o){ opt = o; });
      s.remove('a');
      assert('a' == opt.name);
    })
  })

  describe('.get', function(){
    describe('(name)', function(){
      it('should get an option', function(){
        var s = select().add('foo');
        assert('foo' == s.get('foo').value);
      })

      it('should get an option with el which refers to actual DOM element', function(){
        var s = select().add('foo');
        var foo = s.get('foo');
        foo.el.innerHTML = 'the foo';
        assert('the foo' == s.opts.children[0].innerHTML);
      })

    })

    describe('()', function(){
      it('should return the dropdown', function(){
        var s = select().add('foo');
        assert(s.dropdown == s.get().el);
      })
    })
  })

  describe('.select(name)', function(){
    it('should add `.selected` to `.el`', function(){
      var s = select().add('o').select('o');
      assert(dom(s.el).hasClass('selected'));
    })

    it('should emit `selected` with the option', function(){
      var opt;

      select()
      .add('o')
      .on('select', function(o){ opt = o; })
      .select('o');

      assert('o' == opt.name);
    })

    it('should set `hidden` attribute on the selected element', function(){
      var opt = select().add('o').select('o').get('o');
      assert(opt.el.hasAttribute('hidden'));
    })

    it('should add `.selected` class to the element', function(){
      var opt = select().add('o').select('o').get('o');
      assert(dom(opt.el).hasClass('selected'));
    })

    it('should add .selected = true to the option object', function(){
      assert(select().add('o').select('o').get('o').selected);
    })

    describe('when single', function(){
      var s = select();

      it('should set ._selected to arr with the option', function(){
        s.add('o').select('o');
        assert(s.get('o') == s.selected()[0]);
      })

      it('should override selected when selecting something else', function(){
        s.add('b').select('b');
        assert(s.get('b') == s.selected()[0]);
        assert(1 == s.selected().length);
      })
    })

    describe('when multiple', function(){
      it('should push to ._selected', function(){
        var s = select().add('a').add('b').multiple();
        s.select('a').select('b');
        assert(2 == s.selected().length);
      })
    })
  })

  describe('.deselect(name)', function(){
    it('should emit `deselect` with `opt`', function(){
      var opt;

      select()
      .add('a')
      .select('a')
      .on('deselect', function(o){ opt = o; })
      .deselect('a');

      assert('a' == opt.name);
    })

    it('should remove `hidden` attr', function(){
      var opt;

      select()
      .add('a')
      .select('a')
      .on('deselect', function(o){ opt = o; })
      .deselect('a');

      assert(!opt.el.hasAttribute('hidden'));
    })

    it('should remove `.selected` class', function(){
      var opt;

      select()
      .add('a')
      .select('a')
      .on('deselect', function(o){ opt = o; })
      .deselect('a');

      assert(!dom(opt.el).hasClass('selected'));
    })

    describe('when single', function(){
      it('should set ._selected to []', function(){
        assert(0 == select()
        .add('a')
        .select('a')
        .on('deselect', function(o){ opt = o; })
        .deselect('a')
        .selected().length);
      })
    })

    describe('when multiple', function(){
      it('should remove the option from `._selected`', function(){
        assert(2 == select()
          .multiple()
          .add('a')
          .add('b')
          .add('c')
          .select('a')
          .select('b')
          .select('c')
          .deselect('a')
          .selected()
          .length);
      })
    })
  })

  describe('.hide', function(){
    describe('(name)', function(){
      it('should add `hidden` attr to the opt', function(){
        var el = select().add('a').hide('a').options.a.el;
        assert(el.hasAttribute('hidden'));
      })
    })

    describe('()', function(){
      it('should add `hidden` attr to the dropdown', function(){
        var el = select().add('a').hide().dropdown;
        assert(el.hasAttribute('hidden'));
      })
    })
  })

  describe('.show', function(){
    describe('(name)', function(){
      it('should remove `hidden` attr from the opt', function(){
        var el = select().add('a').hide('a').show('a').options.a.el;
        assert(!el.hasAttribute('hidden'));
      })
    })

    describe('()', function(){
      it('should remove `hidden` attr from the dropdown', function(){
        var el = select().add('a').hide().show().dropdown;
        assert(!el.hasAttribute('hidden'));
      })
    })
  })

  describe('.visible', function(){
    describe('(name)', function(){
      it('should be true if opt is visible', function(){
        assert(select().add('a').visible('a'));
      })
    })

    describe('()', function(){
      it('should be `true` if dropdown is visible', function(){
        assert(select().show().visible());
      })
    })
  })

  describe('.toggle', function(){
    describe('(name)', function(){
      it('should hide opt if visible', function(){
        assert(select().add('a').toggle('a').get('a').el.hasAttribute('hidden'));
      })

      it('should show if hidden', function(){
        assert(!select().add('a').hide('a').toggle('a').get('a').el.hasAttribute('hidden'));
      })
    })
  })

  describe('.disable(name)', function(){
    it('should add `disabled` attr', function(){
      assert(select().add('a').disable('a').get('a').el.hasAttribute('disabled'));
    })
  })

  describe('.enable', function(){
    it('should remove `disabled` attr', function(){
      assert(!select()
        .add('a')
        .disable('a')
        .enable('a')
        .get('a').el
        .hasAttribute('disabled'));
    })
  })

  describe('.selected', function(){
    describe('([a, b])', function(){
      it('should select a and b opts', function(){
        assert(2 == select()
          .multiple()
          .add('a')
          .add('b')
          .selected(['a', 'b'])
          .selected()
          .length);
      })
    })
    describe('()', function(){
      it('should return selected options', function(){
        assert(0 == select().selected());
      })
    })
  })

  describe('.highlight(name)', function(){
    it('should set `.active` to the option element', function(){
      var sel = select().add('s').highlight('s');
      assert(sel.active == sel.get('s').el);
    })
    it('should add `.highlight` to the option element', function(){
      var s = select().add('s').highlight('s');
      assert(dom(s.active).hasClass('highlighted'));
    })
  })

  describe('.dehighlight()', function(){
    it('should de-highlight the active option', function(){
      var sel = select().add('s').highlight('s');
      var el = sel.active;
      assert(sel.active);
      sel.dehighlight();
      assert(!dom(el).hasClass('highlighted'));
      assert(!sel.active);
    })
  })

  describe('.values()', function(){
    describe('when something is selected', function(){
      describe('when single', function(){
        it('should return an array with a single value', function(){
          assert(1 == select()
            .add('one', 1)
            .add('two', 2)
            .select('two')
            .select('one')
            .values()[0])
        })
      })

      describe('when multiple', function(){
        it('should return an array with selected values', function(){
          var vals = select()
            .multiple()
            .add('Go', 'golang')
            .add('Lua')
            .add('JS')
            .select('go')
            .select('lua')
            .values();

          assert('golang' == vals[0]);
          assert('lua' == vals[1]);
        })
      })
    })

    describe('when nothing is selected', function(){
      it('should return an empty array', function(){
        assert(0 == select().values());
      })
    })
  })

  describe('.search(term)', function(){
    describe('when there are no listeners to `search`', function(){
      it('should work', function(){
        var opts = select()
          .add('one')
          .add('two')
          .add('three')
          .search('o')
          .opts;

        assert(2 == dom('.select-option:not([hidden])', opts).length());
      })
    })

    describe('when there are listeners to `search` it shouldnt work', function(){
      var opts = select()
        .add('one')
        .add('two')
        .add('three')
        .on('search', function(){})
        .search('o')
        .opts;

      assert(3 == dom('.select-option:not([hidden])', opts).length());
    })
  })
})
