# select

  modern &lt;select&gt;. (WIP)

  [![select](https://i.cloudup.com/j1xDWsU3FM.gif)](https://cloudup.com/cg4UdfFX5js)

```js
select
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

#### .label(label)

Set the label.

#### .multiple([label])

Allow multiple selections.

#### .searchable([label])

Allow search.

#### add(name[, value])

Add an option with `name` and optional `value`.

#### select(name)

Select an option with `name`.

#### deselect(name)

De-select `name`.

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

```js
select = select()
  .add('one')
  .add('two')
  .on('search', function(term){
    ajax(term, function(opts){
      opts.forEach(select.add, select)
    })
  });
```

### Events

#### "add"

Emitted when you add an `option` with an object:

    {
      name: <lowercase option name>
      value: <the option value>
      el: <the element>
    }

#### "select"

Emitted when an option is selected.

    {
      name: <lowercase option name>
      value: <the option value>
      el: <the element>
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

## License

  MIT
