/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-selectize',
  included: function(app) {
    //default theme name is 'default'
    var options = app.options['ember-cli-selectize'] || { theme: 'default' };

    //import theme based on options
    if (options.theme){
      app.import(app.bowerDirectory + '/selectize/dist/css/selectize.' + options.theme + '.css');
    }

    //import javascript
    app.import(app.bowerDirectory + '/selectize/dist/js/standalone/selectize.js');
  }
};
