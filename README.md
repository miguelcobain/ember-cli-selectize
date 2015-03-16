# Ember-cli-selectize [![Build Status](https://travis-ci.org/miguelcobain/ember-cli-selectize.svg)](https://travis-ci.org/miguelcobain/ember-cli-selectize) [![Ember Observer Score](http://emberobserver.com/badges/ember-cli-selectize.svg)](http://emberobserver.com/addons/ember-cli-selectize)

An Ember and Selectize integration, packaged as an Ember-cli addon. Check [Selectize](http://brianreavis.github.io/selectize.js/) and [Ember-cli](http://www.ember-cli.com/)!

## Demo

Check (old demo): http://miguelcobain.github.io/ember-selectize

## Browser Support

Should run wherever Ember and Selectize run.

## Installation

### As an Ember CLI addon

Run `ember install:addon ember-cli-selectize` on your project folder.

## Usage

This addon provides an `ember-selectize` component.
Its usage should be very similar to `Ember.Select`, but with additional features.

```handlebars
{{ember-selectize
  content=controller.items
  optionValuePath="content.id"
  optionLabelPath="content.name"
  selection=model.item
  placeholder="Select an item" }}
```

### Properties

- `content` - Array containing all the options to select from
- `selection` - Ember-selectize will set this property to the selection that was made. Usually some property on a model, for example. If `multiple` is `true`, then it should be an array.
- `value` - Ember-selectize will set this property to the *value of the selection* that was made. It is not currently supported in multiple selection mode.
- `optionValuePath` - Selectize requires a unique hash for each option available. Set this to a path to such a property on your options. Prefix with `content.`. Example: `content.id`
- `optionLabelPath` - Set this to a path where selectize can get a label for display. Computed properties are many times useful for this. Example: `content.name`
- `plugins` - Set this to a comma delimited list of selectize plugins to override the default plugin selection (currently remove_button). Note, not all plugins have been tested to work with ember-cli-selectize, YMMV. Example: `restore_on_backspace,drag_drop`
- `placeholder` or `prompt` - Set any of these to display a text when there is no choice made. Example `"Please select an- option"`
- `disabled` - If `true` disables changes in selectize
- `multiple` - If `true` ember-selectize will enter multiple mode. `selection` is an array of options.
- `sortField` - Pass a string of a property to sort by. You can also pass an array of objects `[{ field: 'someProperty', direction: 'asc' }, {/*...*/}]`. See [selectize usage](https://github.com/brianreavis/selectize.js/blob/master/docs/usage.md) for details. Example: `"name"`
- `sortDirection` - If `sortField` is a string, specify the direction. Example: `"asc"` or `"desc"`. This is ignored if `sortField` is an array (you can specify direction inside that array).
- `filter` - This property will have the text that the user entered to filter options. Useful for searching options in server from a large set.
- `loading` - When `true` ember-selectize adds a loading class to selectize wrapper. Just like selectize does. Then you can customize. Useful with async relationships or "finds" in Ember-Data: `loading=types.isPending`.
- `optionFunction`, `itemFunction`, `optionCreateFunction`, `optgroupHeaderFunction`, `optgroupFunction`  - Will be called on the component with two parameters `data` and `escape`. `escape` is a function to escape text. These functions are expected to build the desired html and return it as a string. These functions take precedence over their `*Template` and `*View` counterparts.
- `optionTemplate`,`itemTemplate`,`optionCreateTemplate`,`optgroupHeaderTemplate`,`optgroupTemplate` `optionView`,`itemView`,`optionCreateView`,`optgroupHeaderView` and `optgroupView` - Render using templates or views! View takes precedence over template, so if you do strange things like setting optionView and optionTemplate, the latter will be ignored. Might not work with all Ember versions. This is delicate. Check [this issue](https://github.com/miguelcobain/ember-selectize/issues/13#issuecomment-56155784).
- `required` - If `true` adds `required` attribute

ember-selectize also supports [selectize's general options](https://github.com/brianreavis/selectize.js/blob/master/docs/usage.md#general), excluding `options` and `items` (equivalent to `content` and `selection` respectively).

### Actions

Ember is moving towards a paradigm that encourages the use of actions. With this in mind, ember selectize provides a set of actions. The goal is to not use two way data bindings, that is, you pass the data to your components, but the components send actions up to let you (and only you) change the data. Here are the actions the ember selectize supports:

- `onCreate` - sent when the user creates a tag. The text is sent as a parameter.
- `onType` - sent when the user types in the input element (functional equivalent of observing `filter` property)
- `onSelect` - sent when the user selects an item (functional equivalent of observing `selection` property). The selected object is sent as a parameter. When the user deselects the option, parameter is `null`.
- `onAdd` - sent when the user selects an item in multiple mode. The added object is sent as a parameter.
- `onRemove` - sent when the user deselects an item in multiple mode. The removed object is sent as a parameter.

Ember selectize supports both APIs.

More info:
- ember-selectize registers observers on object labels. This is great because if you change the label property anywhere in your application, selectize labels will also update.

### Theme customization

You can customize which theme to use in your Brocfile.
```javascript
//your-app/Brocfile.js

var EmberApp = require('ember-cli/lib/broccoli/ember-app');

var app = new EmberApp({
  'ember-cli-selectize': {
    //valid values are `default`, `bootstrap2`, `bootstrap3` or false
    'theme': 'bootstrap3'
  }
});

module.exports = app.toTree();
```

If you want to use the default theme, you don't need to specify any option.
If you don't want to include any css at all for some reason, simply assign `false` or any "falsy" value to the `theme` option.

## Running

* `ember server`
* Visit your app at http://localhost:4200.

## Running Tests

* `ember test`
* `ember test --server`

Tests are written in qunit, and some were borrowed from `Ember.Select`.

I've rewritten many of them, but most of them still fail.

This is due to the nature of this component. `Selectize`'s tests assures that everything is ok between Selectize<->DOM.
`Ember.Select`'s tests also test the DOM. This is unecessary in this project.

Ember-selectize tests should be focused between Ember<->Selectize.

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
