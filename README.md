# Ember-cli-selectize [![Build Status](https://travis-ci.org/miguelcobain/ember-cli-selectize.svg)](https://travis-ci.org/miguelcobain/ember-cli-selectize) [![Ember Observer Score](http://emberobserver.com/badges/ember-cli-selectize.svg)](http://emberobserver.com/addons/ember-cli-selectize)

An Ember and Selectize integration, packaged as an Ember-cli addon. Check [Selectize](http://brianreavis.github.io/selectize.js/) and [Ember-cli](http://www.ember-cli.com/)!

## Demo

Check (old demo): http://miguelcobain.github.io/ember-selectize

## Browser Support

Should run wherever Ember and Selectize run.

## Installation

### As an Ember CLI addon

Run either command below depending on Ember version in your project folder.

For Ember CLI >= `0.2.3`:

```shell
ember install ember-cli-selectize
```

For Ember CLI < `0.2.3`:

```shell
ember install:addon ember-cli-selectize
```

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

<table width="100%">
  <tr>
  	<th valign="top" width="120px" align="left">Property</th>
  	<th valign="top" align="left">Description</th>
  </tr>
  <tr>
    <td valign="top"><code>content</code></td>
    <td valign="top">Array containing all the options to select from</td>
  </tr>
  <tr>
    <td valign="top"><code>selection</code></td>
    <td valign="top">Ember-selectize will set this property to the selection that was made. Usually some property on a model, for example. If <code>multiple</code> is <code>true</code>, then it should be an array.</td>
  </tr>
  <tr>
    <td valign="top"><code>value</code></td>
    <td valign="top">Ember-selectize will set this property to the *value of the selection* that was made. It is not currently supported in multiple selection mode.</td>
  </tr>
  <tr>
    <td valign="top"><code>optionValuePath</code></td>
    <td valign="top">Selectize requires a unique hash for each option available. Set this to a path to such a property on your options. Prefix with <code>content.</code>. Example: <code>content.id</code></td>
  </tr>
  <tr>
    <td valign="top"><code>optionLabelPath</code></td>
    <td valign="top">Set this to a path where selectize can get a label for display. Computed properties are many times useful for this. If Ember-selectize detects a "falsy" value, it will use an empty string. Example: <code>content.name</code></td>
  </tr>
  <tr>
    <td valign="top"><code>plugins</code></td>
    <td valign="top">Set this to a comma delimited list of selectize plugins to override the default plugin selection (currently remove_button). Note, not all plugins have been tested to work with ember-cli-selectize, YMMV. Example: <code>restore_on_backspace,drag_drop</code></td>
  </tr>
  <tr>
    <td valign="top"><code>placeholder</code> or <code>prompt</code></td>
    <td valign="top">Set any of these to display a text when there is no choice made. Example <code>"Please select an option"</code></td>
  </tr>
  <tr>
    <td valign="top"><code>disabled</code></td>
    <td valign="top">If <code>true</code> disables changes in selectize</td>
  </tr>
  <tr>
    <td valign="top"><code>multiple</code></td>
    <td valign="top">If <code>true</code> ember-selectize will enter multiple mode. <code>selection</code> is an array of options.</td>
  </tr>
  <tr>
    <td valign="top"><code>sortField</code></td>
    <td valign="top">Pass a string of a property to sort by. You can also pass an array of objects <code>[{ field: 'someProperty', direction: 'asc' }, {/*...*/}]</code>. See <a href="https://github.com/brianreavis/selectize.js/blob/master/docs/usage.md">selectize usage</a> for details. Example: <code>"name"</code></td>
  </tr>
  <tr>
    <td valign="top"><code>sortDirection</code></td>
    <td valign="top">If <code>sortField</code> is a string, specify the direction. Example: <code>"asc"</code> or <code>"desc"</code>. This is ignored if <code>sortField</code> is an array (you can specify direction inside that array).</td>
  </tr>
  <tr>
    <td valign="top"><code>searchField</code></td>
    <td valign="top">If <code>searchField</code> is a string, it specifies what field should be searched on. It also accepts an array to search on multiple fields, e.g., <code>['label', 'value']</code>. Defaults to <code>'label'</code>.</td>
  <tr>
    <td valign="top"><code>filter</code></td>
    <td valign="top">This property will have the text that the user entered to filter options. Useful for searching options in server from a large set.</td>
  </tr>
  <tr>
    <td valign="top"><code>loading</code></td>
    <td valign="top">When <code>true</code> ember-selectize adds a loading class to selectize wrapper. Just like selectize does. Then you can customize. Useful with async relationships or "finds" in Ember-Data: <code>loading=types.isPending</code>.</td>
  </tr>
  <tr>
    <td valign="top">
      <code>optionFunction</code>, <code>itemFunction</code>, <code>optionCreateFunction</code>, <code>optgroupHeaderFunction</code>, <code>optgroupFunction</code>
    </td>
    <td valign="top">Will be called on the component with two parameters <code>data</code> and <code>escape</code>. <code>escape</code> is a function to escape text. These functions are expected to build the desired html and return it as a string or DOM elements. These functions take precedence over their <code>Component</code> counterparts.</td>
  </tr>
  <tr>
    <td valign="top">
      <code>optionComponent</code>, <code>itemComponent</code>,
      <code>optionCreateComponent</code>, <code>optgroupHeaderComponent</code>
      and <code>optgroupComponent</code>
    </td>
    <td valign="top">Render using components! Functions (see above) take precedence over components, so if you do strange things like setting <code>optionFunction</code> and <code>optionComponent</code>, the latter will be ignored. Inside your component and template <code>data</code> will contain the data for the current item being rendered. An example component could be <code>Hi, {{data.firstname}}!</code></td>
  </tr>
  <tr>
    <td valign="top"><code>required</code></td>
    <td valign="top">If <code>true</code> adds <code>required</code> attribute</td>
  </tr>
</table>

ember-selectize also supports [selectize's general options](https://github.com/brianreavis/selectize.js/blob/master/docs/usage.md#general), excluding `options` and `items` (equivalent to `content` and `selection` respectively).

### Actions

Ember is moving towards a paradigm that encourages the use of actions. With this in mind, ember selectize provides a set of actions. The goal is to not use two way data bindings, that is, you pass the data to your components, but the components send actions up to let you (and only you) change the data. Here are the actions the ember selectize supports:

<table width="100%">
  <tr>
  	<th valign="top" width="160px" align="left">Action</th>
  	<th valign="top" align="left">Description</th>
  </tr>
  <tr>
    <td valign="top"><code>create-item</code></td>
    <td valign="top">Sent when the user creates a tag. The text is sent as a parameter.</td>
  </tr>
  <tr>
    <td valign="top"><code>update-filter</code></td>
    <td valign="top">Sent when the user types in the input element (functional equivalent of observing <code>filter</code> property)</td>
  </tr>
  <tr>
    <td valign="top"><code>select-item</code> / <code>select-value</code></td>
    <td valign="top">Sent when the user selects an item (functional equivalent of observing <code>selection</code> property). The selected object is sent as a parameter. When the user deselects the option, parameter is <code>null</code>. `select-value` is identical, but gets the selected value passed in.</td>
  </tr>
  <tr>
    <td valign="top"><code>add-item</code> / <code>add-value</code></td>
    <td valign="top">sent when the user selects an item in multiple mode. The added object is sent as a parameter.  `add-value` is identical, but gets the added value passed in.</td>
  </tr>
  <tr>
    <td valign="top"><code>remove-item</code> / <code>remove-value</code></td>
    <td valign="top">Sent when the user deselects an item in multiple mode. The removed object is sent as a parameter. `remove-value` is identical, but gets the removed value passed in.</td>
  </tr>
  <tr>
    <td valign="top"><code>on-focus</code></td>
    <td valign="top">Sent when the control gains focus.</td>
  </tr>
  <tr>
    <td valign="top"><code>on-blur</code></td>
    <td valign="top">Sent when the control loses focus.</td>
  </tr>
  <tr>
    <td valign="top"><code>on-init</code></td>
    <td valign="top">Sent once the control is completely initialized.</td>
  </tr>
  <tr>
    <td valign="top"><code>score</code></td>
    <td valign="top">Overrides the default score() method if a cutom one is passed as an option to
    the component.</td>
  </tr>
</table>

Ember selectize supports both APIs.

More info:
- ember-selectize registers observers on object labels. This is great because if you change the label property anywhere in your application, selectize labels will also update.

We will folow Ember Select's approach, which is really flexible:

### Option Groups ###

Ember-selectize supports two flavors of option grouping.

#### `#1` optionGroupPath ####

Set `optionGroupPath` to a path for a property to group for.
Example:
```javascript
[
  {
    id: 1,
    category: 'Nature',
    title: 'This title will appear on select'
  },
  {
    id: 2,
    category: 'Nature',
    title: 'This title will appear on select'
  },
  {
    id: 3,
    category: 'Another category',
    title: 'This title will appear on select'
  },
  //...
]
```

`optionGroupPath` would be `"content.category"`, which would group items according to that property automatically.

like

```handlebars
{{ember-selectize optionGroupPath="content.category"}}
```

### `#2` groupedContent ###

If you prefer you can group your items yourself and pass them to ember selectize.
Just set the property `groupedContent` to an array with the following format:

```javascript
[
  {
    label: 'Nature',
    content: [
      {
        id: 1,
        title: 'This title will appear on select'
      },
      {
        id: 2,
        title: 'This title will appear on select'
      }
    ]
  },
  {
    label: 'Another category',
    content: [
      //...
    ]
  },
//...
]
```
and in your template

```handlebars
{{ember-selectize groupedContent=someArray}}
```

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

* `npm test` (Runs `ember try:testall` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

`Selectize`'s tests assures that everything is ok between Selectize<->DOM.
`Ember.Select`'s tests also test the DOM. This is unecessary in this project.

Ember-selectize tests should be focused between Ember<->Selectize.

## Building

* `ember build`

For more information on using ember-cli, visit [http://www.ember-cli.com/](http://www.ember-cli.com/).
