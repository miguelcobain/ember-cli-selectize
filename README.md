# Ember-cli-selectize

An Ember and Selectize integration, packaged as an Ember-cli addon. Check [Selectize](http://brianreavis.github.io/selectize.js/) and [Ember-cli](http://www.ember-cli.com/)!

## Demo

Check (old demo): http://miguelcobain.github.io/ember-selectize

## Browser Support

Should run wherever Ember and Selectize run.

## Installation

### As an Ember CLI addon

Run `npm install --save-dev ember-cli-selectize` on your project folder.

Run `ember g ember-cli-selectize` to install selectize dependency from bower.

### As a Standalone Library

Download a [release][releases].

[releases]: https://github.com/miguelcobain/ember-cli-selectize/releases

Copy to your vendor directory and link up the .js file.

## Usage

This addon provides `ember-selectize` component.
Its usage should be very similar to `Ember.Select`, but with additional features.

```handlebars
{{ember-selectize
  content=controller.types
  optionValuePath="content.id"
  optionLabelPath="content.name"
  selection=model.type
  placeholder="Select an option" }}
```

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
