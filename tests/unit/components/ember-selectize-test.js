import Ember from 'ember';
import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('ember-selectize', 'EmberSelectizeComponent');

test('it renders', function(assert) {
  assert.expect(2);

  // creates the component instance
  var component = this.subject();
  assert.equal(component._state, 'preRender');

  // appends the component to the page
  this.render();
  assert.equal(component._state, 'inDOM');

  //test select tagname and ember-selectize class
});

test('multiple attribute is bound', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('multiple', true);
  });
  assert.equal(this.$().attr('multiple'), 'multiple');
});

test('autocomplete attribute is bound and off', function(assert) {
  var component = this.subject();
  assert.equal(this.$().attr('autocomplete'), 'off');
});

test('required attribute is bound', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('required', true);
  });
  assert.equal(this.$().attr('required'), 'required');
});

test('maxItems is passed to selectize', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('maxItems', 10);
  });
  this.render();
  assert.equal(component._selectize.settings.maxItems, 10);
});

test('placeholder is passed to selectize', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('placeholder', 'some placeholder here');
  });
  this.render();
  assert.equal(component._selectize.settings.placeholder, 'some placeholder here');
});

var exampleObjectContent = function() {
  return [{
      id: 1,
      label: 'item 1'
    }, {
      id: 2,
      label: 'item 2'
    }, {
      id: 3,
      label: 'item 3'
    }
  ];
};

var objectSize = function(obj) {
  var size = 0; var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

var asArray = function(obj, path) {
  var key; var values = [];
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      if (path) {
        values.push(obj[key][path]);
      } else {
        values.push(obj[key]);
      }
    }
  }
  return values;
};

var keysToArray = function(obj) {
  var key; var keys = [];
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      keys.push(key);
    }
  }
  return keys;
};

test('selectize has correct number of options', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', ['item 1', 'item 2', 'item 3']);
  });
  this.render();
  assert.equal(objectSize(component._selectize.options), 3);
});

test('if no optionValuePath pass selectize the value itself', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', ['item 1', 'item 2', 'item 3']);
  });
  this.render();
  assert.deepEqual(keysToArray(component._selectize.options), ['item 1', 'item 2', 'item 3']);
  assert.deepEqual(asArray(component._selectize.options, 'value'), ['item 1', 'item 2', 'item 3']);
});

test('if no optionLabelPath pass selectize the value itself', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', ['item 1', 'item 2', 'item 3']);
  });
  this.render();
  assert.deepEqual(asArray(component._selectize.options, 'label'), ['item 1', 'item 2', 'item 3']);
});

test('optionValuePath passes selectize the desired value', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', exampleObjectContent());
    component.set('optionValuePath', 'id');
  });
  this.render();
  assert.deepEqual(asArray(component._selectize.options, 'value'), asArray(exampleObjectContent(), 'id'));
});

test('optionLabelPath passes selectize the desired label', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', exampleObjectContent());
    component.set('optionValuePath', 'id');
    component.set('optionLabelPath', 'label');
  });
  this.render();
  assert.deepEqual(asArray(component._selectize.options, 'label'), asArray(exampleObjectContent(), 'label'));
});

test('adding to content updates selectize options', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', ['item 1', 'item 2', 'item 3']);
  });
  this.render();
  assert.equal(objectSize(component._selectize.options), 3);

  Ember.run(function() {
    component.get('content').pushObject('extra item');
  });

  assert.equal(objectSize(component._selectize.options), 4);
});

test('removing from content updates selectize options', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', ['item 1', 'item 2', 'item 3']);
  });
  this.render();
  assert.equal(objectSize(component._selectize.options), 3);
  Ember.run(function() {
    component.get('content').removeObject('item 1');
  });

  assert.equal(objectSize(component._selectize.options), 2);
});

test('replacing content updates selectize options', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', ['item 1', 'item 2', 'item 3']);
  });
  this.render();
  assert.equal(objectSize(component._selectize.options), 3);
  Ember.run(function() {
    component.set('content', ['item 1']);
  });

  assert.equal(objectSize(component._selectize.options), 1);
  assert.deepEqual(asArray(component._selectize.options, 'label'), ['item 1']);
});

test('having a selection creates selectize with a selection', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', ['item 1', 'item 2', 'item 3']);
    component.set('selection', 'item 2');
  });
  this.render();
  assert.equal(component._selectize.items.length, 1);
  assert.deepEqual(component._selectize.items, ['item 2']);
});

test('having a multiple selection creates selectize with a selection', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', ['item 1', 'item 2', 'item 3']);
    component.set('selection', ['item 2', 'item 3']);
    component.set('multiple', true);
  });
  this.render();
  assert.equal(component._selectize.items.length, 2);
  assert.deepEqual(component._selectize.items, ['item 2', 'item 3']);
});

test('updating a selection updates selectize selection', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', ['item 1', 'item 2', 'item 3']);
    component.set('selection', 'item 2');
  });
  this.render();
  assert.equal(component._selectize.items.length, 1);
  assert.deepEqual(component._selectize.items, ['item 2']);
  Ember.run(function() {
    component.set('selection', 'item 3');
  });
  assert.equal(component._selectize.items.length, 1);
  assert.deepEqual(component._selectize.items, ['item 3']);
});

test('replacing a multiple selection updates selectize selection', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', ['item 1', 'item 2', 'item 3', 'item 4']);
    component.set('selection', ['item 2', 'item 3']);
    component.set('multiple', true);
  });
  this.render();
  assert.equal(component._selectize.items.length, 2);
  assert.deepEqual(component._selectize.items, ['item 2', 'item 3']);
  Ember.run(function() {
    component.set('selection', ['item 1', 'item 2', 'item 4']);
  });
  assert.equal(component._selectize.items.length, 3);
  assert.deepEqual(component._selectize.items, ['item 1', 'item 2', 'item 4']);
});

test('adding a multiple selection updates selectize selection', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', ['item 1', 'item 2', 'item 3', 'item 4']);
    component.set('selection', ['item 2', 'item 3']);
    component.set('multiple', true);
  });
  this.render();
  assert.equal(component._selectize.items.length, 2);
  assert.deepEqual(component._selectize.items, ['item 2', 'item 3']);
  Ember.run(function() {
    component.get('selection').pushObject('item 4');
  });
  assert.equal(component._selectize.items.length, 3);
  assert.deepEqual(component._selectize.items, ['item 2', 'item 3', 'item 4']);
});

test('it sends type action when changing filter', function(assert) {
  assert.expect(1);

  var testText = 'dummy text';
  var component = this.subject();
  var targetObject = {
    externalAction: function(query) {
      assert.equal(query, testText, 'externalAction was called with proper argument');
    }
  };

  component.set('type', 'externalAction');
  component.set('targetObject', targetObject);

  Ember.run(function() {
    component._onType(testText);
  });
});

test('it sends create action when an item is created in selectize', function(assert) {
  assert.expect(1);

  var testText = 'dummy text';
  var component = this.subject();
  var targetObject = {
    externalAction: function(query) {
      assert.equal(query, testText, 'externalAction was called with proper argument');
    }
  };
  this.render();
  component.set('create', 'externalAction');
  component.set('targetObject', targetObject);

  Ember.run(function() {
    component._create(testText, function() {});
  });
});

test('it sends select action when an item is selected', function(assert) {
  assert.expect(1);

  var component = this.subject();

  var targetObject = {
    externalAction: function(obj) {
      assert.equal(obj, 'item 3', 'externalAction was called with proper argument');
    }
  };

  Ember.run(function() {
    component.set('content', ['item 1', 'item 2', 'item 3', 'item 4']);
    component.set('select', 'externalAction');
    component.set('targetObject', targetObject);
  });

  this.render();

  Ember.run(function() {
    component._onItemAdd('item 3');
  });
});

test('it sends select action when an item is deselected', function(assert) {
  assert.expect(1);

  var component = this.subject();

  var targetObject = {
    externalAction: function(obj) {
      assert.equal(obj, null, 'externalAction was called with proper argument');
    }
  };

  Ember.run(function() {
    component.set('content', ['item 1', 'item 2', 'item 3', 'item 4']);
    component.set('selection', 'item 1');
    component.set('select', 'externalAction');
    component.set('targetObject', targetObject);
  });

  this.render();

  Ember.run(function() {
    component._onItemRemove('item 1');
  });
});

test('it sends add action when an item is selected in multiple mode', function(assert) {
  assert.expect(1);

  var component = this.subject();

  var targetObject = {
    externalAction: function(obj) {
      assert.equal(obj, 'item 3', 'externalAction was called with proper argument');
    }
  };

  Ember.run(function() {
    component.set('multiple', true);
    component.set('content', ['item 1', 'item 2', 'item 3', 'item 4']);
    component.set('selection', ['item 2']);
    component.set('add', 'externalAction');
    component.set('targetObject', targetObject);
  });

  this.render();

  Ember.run(function() {
    component._onItemAdd('item 3');
  });
});

test('it sends remove action when an item is deselected in multiple mode', function(assert) {
  assert.expect(1);

  var component = this.subject();

  var targetObject = {
    externalAction: function(obj) {
      assert.equal(obj, 'item 2', 'externalAction was called with proper argument');
    }
  };

  Ember.run(function() {
    component.set('multiple', true);
    component.set('content', ['item 1', 'item 2', 'item 3', 'item 4']);
    component.set('selection', ['item 2']);
    component.set('remove', 'externalAction');
    component.set('targetObject', targetObject);
  });

  this.render();

  Ember.run(function() {
    component._onItemRemove('item 2');
  });
});
