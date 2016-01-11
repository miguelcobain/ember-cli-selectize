import Ember from 'ember';
import { module, test } from 'qunit';
import startApp from 'dummy/tests/helpers/start-app';

var application;

module('Acceptance | ember selectize test', {
  beforeEach: function() {
    application = startApp();
  },

  afterEach: function() {
    Ember.run(application, 'destroy');
  }
});

test('template specified by optionTemplate is used', function(assert) {
  visit('/');

  andThen(function() {
    click('#template-test .selectize-control');

    assert.equal(
      find('#template-test .selectize-dropdown-content div:eq(0)').text(),
      'Hi, Item 1'
    );
    assert.equal(
      find('#template-test .selectize-dropdown-content div:eq(1)').text(),
      'Hi, Item 2'
    );
  });
});
