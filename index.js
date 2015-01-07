/* jshint node: true */
'use strict';

module.exports = {
  name: 'ember-cli-selectize',
  included: function(app) {
    //default theme name is 'default'
    var options = app.options['ember-cli-selectize'] || { theme: 'default' };

    //import theme based on options
    if(options.theme === 'default'){
      //special case for default theme because `selectize.default.css`
      //includes both core and theme styles
      app.import('bower_components/selectize/dist/css/selectize.default.css');
    } else if(options.theme){
      //include core styles and `selectize.[theme-name].css`
      app.import('bower_components/selectize/dist/css/selectize.css');
      app.import('bower_components/selectize/dist/css/selectize.'+options.theme+'.css');
    }

    //import javascript
    app.import('bower_components/selectize/dist/js/standalone/selectize.js');
  }
};
