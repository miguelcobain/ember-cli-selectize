/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-selectize',
  included: function(app) {
    var selectizePath   = 'bower_components/selectize/dist/';
    app.import(selectizePath+'js/standalone/selectize.js');
    app.import(selectizePath+'css/selectize.css');
  }
};
