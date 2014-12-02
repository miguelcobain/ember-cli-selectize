/* global define, require, window */
var addonName = 'ember-off-canvas-components';

define('ember', ["exports"], function(__exports__) {
  __exports__['default'] = window.Ember;
});

var index = addonName + '/index';
define(addonName, ["exports"], function(__exports__) {
  var library = require(index);
  Object.keys(lf).forEach(function(key) {
    __exports__[key] = library[key];
  });
});

// Glue library to a global var
window.EmberOffCanvasComponents = window.EOC = require(index);

// Register library items in the container
var shim = addonName + '-shim';
window.Ember.Application.initializer({
  name: shim,

  initialize: function(container) {
    require(shim).initialize(container);
  }
});

// Register Custom Events on the Application
var customEventsInitializer = 'ember-off-canvas-components/initializers/custom-events';
window.Ember.Application.initializer({
  name: customEventsInitializer,

  initialize: function(container, application) {
    var customEvents = require(customEventsInitializer);
    customEvents.initialize(container, application);
  }
});
