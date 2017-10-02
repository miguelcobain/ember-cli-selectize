/* jshint node: true */
'use strict';

var path = require('path');
var existsSync = require('exists-sync');
var fastbootTransform = require('fastboot-transform');
var Funnel = require('broccoli-funnel');
var MergeTrees = require('broccoli-merge-trees');


module.exports = {
  name: 'ember-cli-selectize',
  included: function(app) {
    this._super.included.apply(this, arguments);

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

    //default theme name is 'default'
    var options = { theme: 'default' };
    if (app.options && app.options['ember-cli-selectize']) {
      options = app.options['ember-cli-selectize'];
    }

    //import theme based on options
    if (options.theme) {
      app.import(app.bowerDirectory + '/selectize/dist/css/selectize.' + options.theme + '.css');
    }

    //import javascript
    app.import('vendor/selectize/selectize.js');
  },

  treeForVendor(tree) {
    var trees = [];

    if (tree) {
      trees.push(tree);
    }

    var selectizePath = path.join(this.project.root, this.app.bowerDirectory, 'selectize', 'dist', 'js', 'standalone');
    if (existsSync(selectizePath)) {
      var selectizeJsTree = fastbootTransform(new Funnel(selectizePath, {
        files: ['selectize.js'],
        destDir: 'selectize'
      }));

      trees.push(selectizeJsTree);
    }

    return new MergeTrees(trees);
  }
};
