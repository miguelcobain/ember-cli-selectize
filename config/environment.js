/* global module */
var name = require('../package.json').name;

module.exports = function (environment) {
  'use strict';
  environment = environment || 'development';

  var defaultEnv = {
    environment: environment,
    addonPrefix: name,
    shimName: name + '-shim'
  };

  var ENV = {
    development: defaultEnv,
    test: defaultEnv,
    production: defaultEnv
  };
  return ENV[environment];
};
