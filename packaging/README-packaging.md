# Build as a Standalone Library

Not running Ember CLI yet, no problem. This repo includes a release for you too.

The scripts in this packaging directory are used to generate the releases available as individual files on the [releases] page.

[releases]: https://github.com/pixelhandler/ember-off-canvas-components/releases

From the root of this project run

    npm run prepublish

* The /dist directory will have the (global/shim) files for use in apps not running Ember CLI

*Thanks...*

* [liquid-fire] - This global/shim build is based on liquid-fire's packaging

[liquid-fire]: https://github.com/ef4/liquid-fire
