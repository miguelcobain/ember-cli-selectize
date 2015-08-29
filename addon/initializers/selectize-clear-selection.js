/**
 * Based on https://gist.github.com/jumika/abe412f1aa2b24ea86e6
 */
import Ember from 'ember';

export default function() {
  /* globals Selectize */
  Selectize.define('clear_selection', function(options) {
    var self = this;
    var settings = Ember.$.extend({
      title: 'Clear selection'
    }, options);

    //Overriding because, ideally you wouldn't use header & clear_selection simultaneously
    self.plugins.settings.dropdown_header = {
      title: settings.title
    };
    this.require('dropdown_header');

    self.setup = (() => {
      var original = self.setup;
      return () => {
        original.apply(this, arguments);
        this.$dropdown.find('.selectize-dropdown-header').addClass('clear-selection').on('mousedown', () => {
          self.clear();
          self.close();
          self.blur();
          return false;
        });
      };
    })();
  });
}
