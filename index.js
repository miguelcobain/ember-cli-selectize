/* jshint node: true */
'use strict';

var path = require('path');


module.exports = {
  name: 'ember-cli-selectize',
  included: function(app) {
    app.import('bower_components/selectize/dist/js/standalone/selectize.js');
    app.import('bower_components/selectize/dist/css/selectize.css');
  }
};
