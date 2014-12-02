/* jshint node: true */
var mergeTrees = require('broccoli-merge-trees');
var pickFiles = require('broccoli-static-compiler');
var compileES6 = require('broccoli-es6-concatenator');
var templateCompiler = require('broccoli-ember-hbs-template-compiler');
var es3Safe = require('broccoli-es3-safe-recast');
var Funnel = require('broccoli-funnel');
var registry = require('./registry');
var wrap = require('./wrap');
var packageDetails = require('../package.json');
var version = packageDetails.version;
var name = packageDetails.name;

var appTree = pickFiles('../app', { srcDir: '/', destDir: 'app'});

var templateTree = templateCompiler('../app/templates', { module: true });
templateTree = pickFiles(templateTree, {srcDir: '/', destDir: 'app/templates'});

var addonTree = pickFiles('../addon', {srcDir: '/', destDir: name});
var precompiled = mergeTrees([addonTree, appTree, templateTree]);
var registrations = registry(pickFiles(precompiled, {srcDir: '/app', destDir: '/'}));
var bower = pickFiles('../bower_components', {srcDir: '/loader.js', destDir: '/'});
var glue = new Funnel('.', { include: [/^glue\.js$/] });

var jsTree = mergeTrees([glue, mergeTrees([precompiled, registrations, bower])]);

var compiled = compileES6(jsTree, {
  wrapInEval: false,
  loaderFile: 'loader.js',
  inputFiles: [ name + '/index.js', 'app/**/*.js'],
  ignoredModules: ['ember', name],
  outputFile: '/' + name + '-' + version + '.js',
  legacyFilesToAppend: ['registry-output.js', 'glue.js']
});
compiled = wrap(compiled);

var css = new Funnel('../vendor', {
  include: [/\.css$/],
  getDestinationPath: function(relativePath) {
    var cssFile = name + '.css';
    if (relativePath === cssFile) {
      return '/' + name + '-' + version + '.css';
    }
    return relativePath;
  }
});

module.exports = mergeTrees([es3Safe(compiled), css]);
