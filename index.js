/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-selectize',
  included: function(app) {
    // workaround for https://github.com/ember-cli/ember-cli/issues/3718
    if (typeof app.import !== 'function' && app.app) {
      app = app.app;
    }

    //default theme name is 'default'
    var options = { theme: 'default' };
    if (app.options && app.options['ember-cli-selectize']) {
      options = app.options['ember-cli-selectize'];
    }

    if (process.env.EMBER_CLI_FASTBOOT !== 'true') {
      //import theme based on options
      if (options.theme) {
        app.import(app.bowerDirectory + '/selectize/dist/css/selectize.' + options.theme + '.css');
      }

      //import javascript
      app.import(app.bowerDirectory + '/selectize/dist/js/standalone/selectize.js');
    }
  }
};
