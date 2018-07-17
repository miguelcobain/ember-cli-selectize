/* eslint-env node */
'use strict';

const fastbootTransform = require('fastboot-transform');

module.exports = {
  name: 'ember-cli-selectize',
  options: {
    nodeAssets: {
      selectize() {
        return {
          srcDir: 'dist',
          import: {
            include: [
              'js/standalone/selectize.js',
              `css/selectize.${this.theme}.css`
            ],
            processTree(tree) {
              return fastbootTransform(tree);
            }
          }
        };
      }
    }
  },

  included(app) {
    // If the addon has the _findHost() method (in ember-cli >= 2.7.0), we'll just
    // use that.
    if (typeof this._findHost === 'function') {
      app = this._findHost();
    }

    // Otherwise, we'll use this implementation borrowed from the _findHost()
    // method in ember-cli.
    // Keep iterating upward until we don't have a grandparent.
    // Has to do this grandparent check because at some point we hit the project.
    var current = this;
    do {
      app = current.app || app;
    } while (current.parent.parent && (current = current.parent));

    // default theme name is 'default'
    this.theme = 'default';
    if (app.options && app.options['ember-cli-selectize'] && app.options['ember-cli-selectize'].theme) {
      this.theme = app.options['ember-cli-selectize'].theme;
    }

    this._super.included.apply(this, arguments);
  }
};
