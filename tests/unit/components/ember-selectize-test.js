import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('ember-selectize', 'EmberSelectizeComponent');

test('it renders', function() {
  expect(2);

  // creates the component instance
  var component = this.subject();
  equal(component._state, 'preRender');

  // appends the component to the page
  this.append();
  equal(component._state, 'inDOM');
});

test('it sends onType action when changing filter', function() {
  expect(1);

  var testText = 'dummy text';
  var component = this.subject();
  var targetObject = {
    externalAction: function(query) {
      equal(query, testText, 'externalAction was called with proper argument');
    }
  };

  component.set('onType', 'externalAction');
  component.set('targetObject', targetObject);

  component._onType(testText);
});
