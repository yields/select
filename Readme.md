# select

  modern &lt;select&gt;. (WIP)

  [see the demo](http://yields.github.io/select/index.html)

```js
var Select = require('select');

var select = Select()
  .label('Select a language')
  .multiple()
  .add('Javascript')
  .add('Google Go')
  .add('Bash')
  .add('Ruby')
  .add('Lua')
  .add('C++')
  .add('C', 200)
  .select('Jasvascript')
  .select('Google Go')
  .deselect('Google Go');
  .select('c');

document.body.appendChild(select.el);

select.on('change', function(){
  console.log(select.values());
  // => ['javascript', 200]
});
```


## Installation

  Install with [component(1)](http://component.io):

    $ component install yields/select

## API

### Select()

  Initialize a new `Select`.

#### .unbind()

  Unbind internal events.

#### .label(label)

  Set the label.

#### .multiple([label])

  Allow multiple selections.

#### .searchable([label])

  Allow search.

#### add(name[, value [, el]])

  Add an option with `name` and optional `value`.

  An option `el` can be given, this can be either `html` string
  or native `Element`.

    add('js', 0, '<li><img src="js.jpg">Javascript')

#### remove(name)

  Remove an option with `name`.

#### empty()

  Remove all options.

#### select(name)

  Select an option with `name`.

#### deselect(name)

  De-select `name`.

#### focus()

  Focus `<input>`.

#### blur()

  Blur `<input>`.

#### highlight(name)

  Highlight an option by `name`.

  When an option is in "highlight" mode, it will be selected when the
  user hits enter.

#### dehighlight()

  De-highlight "highlight"ed option

#### get(name)

  Get an option with `name`.

#### show([name])

  Show the dropdown or option `name`.

#### hide([name])

  Hide the dropdown or option `name`.

#### visible([name])

  Check if option `name` or dropdown are visible.

#### toggle([name])

  Toggle `.show([name])`, `.hide([name])`.

#### disable(name)

  Disable an option `name`.

#### enable(name)

  Enable an option `name`.

#### selected([options])

  Get / set selected options.

#### values()

  Get selected values.

#### search(term)

  Search options with `term`, if there are listeners for `search` event, the `.search()` method will do nothing.
  this allows you to set up custom search.

    var select = Select()
      .add('one')
      .add('two')
      .on('search', function(term){
        ajax(term, function(opts){
          opts.forEach(select.add, select);
          select.highlight(opts[0].name);
        })
      })

### Events

#### "add"

Emitted when you add an `option` with an object:

    {
      name: <lowercase option name>
      value: <the option value>
      el: <the element>
      selected: <true if the option is selected>
    }

#### "remove"

Emitted when an option is removed, `option` object is given as an argument.

#### "select"

Emitted when an option is selected.

    {
      name: <lowercase option name>
      value: <the option value>
      el: <the element>
      selected: <true if the option is selected>
    }

#### "change"

Emitted with `Select` instance.

#### "deselect"

Emitted with an `option` object.

#### "show"

Emitted when the select dropdown is shown.

#### "hide"

Emitted when the select dropdown is hidden.

#### "search"

Emitted when `.search(term)` is called, if there are listeners
the method `.search(term)` will do nothing.

#### "found"

Emitted after a search was performed with number of matches.

### Tests

```bash
$ make test
```

## License

  MIT
