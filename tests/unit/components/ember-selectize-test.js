import Ember from 'ember';
import {
  moduleForComponent,
  test
} from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('ember-selectize', 'Unit | Component | ember-selectize', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']
  unit: true
});

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

test('name attribute is bound', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('name', 'pouet');
  });
  assert.equal(this.$().attr('name'), 'pouet');
});

test('multiple attribute is bound', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('multiple', true);
  });
  assert.equal(this.$().attr('multiple'), 'multiple');
});

test('autocomplete attribute is bound and off', function(assert) {
  assert.equal(this.$().attr('autocomplete'), 'off');
});

test('required attribute is bound', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('required', true);
  });
  assert.equal(this.$().attr('required'), 'required');
});

test('tabindex attribute is properly set to input', function(assert){
  var component = this.subject();
  var tabindex = 6;

  Ember.run(function() {
    component.set('tabindex', tabindex);
  });

  assert.equal(this.$().parent().find('input').attr('tabindex'), tabindex);
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
  return Ember.A([
    Ember.Object.create({
      id: 1,
      label: 'item 1'
    }), Ember.Object.create({
      id: 2,
      label: 'item 2'
    }), Ember.Object.create({
      id: 3,
      label: 'item 3'
    })
  ]);
};

var exampleGroupedContent = function() {
  return Ember.A([
    Ember.Object.create({
      label: 'Nature',
      content: Ember.A([
        {
          id: 1,
          title: 'This title will appear on select'
        },
        {
          id: 2,
          title: 'This title will appear on select'
        }
      ])
    }),
    Ember.Object.create({
      label: 'Another',
      content: Ember.A([
        {
          id: 3,
          title: 'This title will appear on select'
        }
      ])
    })
  ]);
};
var exampleGroupPathContent = function() {
  return Ember.A([
    {
      id: 1,
      category: 'Nature',
      title: '#1 This title will appear on select'
    },
    {
      id: 2,
      category: 'Nature',
      title: '#2 This title will appear on select'
    },
    {
      id: 3,
      category: 'Another',
      title: '#3 This title will appear on select'
    }
  ]);
};

var objectSize = function(obj) {
  var size = 0; var key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      size++;
    }
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
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3']));
  });
  this.render();
  assert.equal(objectSize(component._selectize.options), 3);
});

test('if no optionValuePath pass selectize the value itself', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3']));
  });
  this.render();
  assert.deepEqual(keysToArray(component._selectize.options), ['item 1', 'item 2', 'item 3']);
  assert.deepEqual(asArray(component._selectize.options, 'value'), ['item 1', 'item 2', 'item 3']);
});

test('if no optionLabelPath pass selectize the value itself', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3']));
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
  assert.deepEqual(exampleObjectContent().mapBy('id'), asArray(component._selectize.options, 'value'));
});

test('optionLabelPath passes selectize the desired label', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', exampleObjectContent());
    component.set('optionValuePath', 'id');
    component.set('optionLabelPath', 'label');
  });
  this.render();
  assert.deepEqual(asArray(component._selectize.options, 'label'), exampleObjectContent().mapBy('label'));
});

test('selectize labels are updated', function(assert) {
  var component = this.subject();
  var content = exampleObjectContent();
  Ember.run(function() {
    component.set('content', content);
    component.set('optionValuePath', 'id');
    component.set('optionLabelPath', 'label');
  });
  this.render();
  assert.deepEqual(asArray(component._selectize.options, 'label'), exampleObjectContent().mapBy('label'));

  Ember.run(function() {
    content.objectAt(0).set('label', 'another label');
  });

  assert.equal(asArray(component._selectize.options, 'label')[0], 'another label');

});

test('adding to content updates selectize options', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3']));
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
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3']));
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
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3']));
  });
  this.render();
  assert.equal(objectSize(component._selectize.options), 3);
  Ember.run(function() {
    component.set('content', Ember.A(['item 1']));
  });

  assert.equal(objectSize(component._selectize.options), 1);
  assert.deepEqual(asArray(component._selectize.options, 'label'), ['item 1']);
});

test('setting initial groupedContent shows correct number of options and optgroups', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('groupedContent', exampleGroupedContent());
  });
  this.render();
  assert.equal(objectSize(component._selectize.options), 3);
  assert.equal(objectSize(component._selectize.optgroups), 2);
});

test('adding to groupedContent parent array updates selectize options', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('groupedContent', exampleGroupedContent());
  });
  this.render();
  assert.equal(objectSize(component._selectize.options), 3);
  assert.equal(objectSize(component._selectize.optgroups), 2);

  Ember.run(function() {
    component.get('groupedContent').addObject(Ember.Object.create({
      label: 'Third Group',
      content: Ember.A([
        {
          id: 3,
          title: 'This title will appear on select'
        }
      ])
    }));
  });

  assert.equal(objectSize(component._selectize.options), 4);
  assert.equal(objectSize(component._selectize.optgroups), 3);
});

test('removing from groupedContent parent array updates selectize options', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('groupedContent', exampleGroupedContent());
  });
  this.render();
  assert.equal(objectSize(component._selectize.options), 3);
  assert.equal(objectSize(component._selectize.optgroups), 2);

  Ember.run(function() {
    component.get('groupedContent').popObject();
  });

  assert.equal(objectSize(component._selectize.options), 2);
  assert.equal(objectSize(component._selectize.optgroups), 1);
});

test('replacing groupedContent parent array updates selectize options', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('groupedContent', exampleGroupedContent());
  });
  this.render();
  assert.equal(objectSize(component._selectize.options), 3);
  assert.equal(objectSize(component._selectize.optgroups), 2);

  Ember.run(function() {
    var _newGroupedContent = exampleGroupedContent();
    _newGroupedContent.addObject(Ember.Object.create({
      label: 'Third Group',
      content: Ember.A([
        {
          id: 3,
          title: 'This title will appear on select'
        }
      ])
    }));
    component.set('groupedContent', _newGroupedContent);
  });

  assert.equal(objectSize(component._selectize.options), 4);
  assert.equal(objectSize(component._selectize.optgroups), 3);
});

test('adding to groupedContent child array updates selectize options', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('groupedContent', exampleGroupedContent());
  });
  this.render();
  assert.equal(objectSize(component._selectize.options), 3);
  assert.equal(objectSize(component._selectize.optgroups), 2);

  Ember.run(function() {
    component.get('groupedContent').findBy('label', 'Another').get('content').addObject({
      id: 3,
      title: 'new item'
    });
  });

  assert.equal(objectSize(component._selectize.options), 4);
  assert.equal(objectSize(component._selectize.optgroups), 2);
});

test('removing from groupedContent child array updates selectize options', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('groupedContent', exampleGroupedContent());
  });
  this.render();
  assert.equal(objectSize(component._selectize.options), 3);
  assert.equal(objectSize(component._selectize.optgroups), 2);

  Ember.run(function() {
    component.get('groupedContent').findBy('label', 'Nature').get('content').popObject();
  });

  assert.equal(objectSize(component._selectize.options), 2);
  assert.equal(objectSize(component._selectize.optgroups), 2);
});

test('replacing groupedContent child array updates selectize options', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('groupedContent', exampleGroupedContent());
  });
  this.render();
  assert.equal(objectSize(component._selectize.options), 3);
  assert.equal(objectSize(component._selectize.optgroups), 2);

  Ember.run(function() {
    var _newGroupedContent = exampleGroupedContent();
    _newGroupedContent.findBy('label', 'Nature').get('content').popObject();
    component.set('content', _newGroupedContent);
  });

  assert.equal(objectSize(component._selectize.options), 2);
  assert.equal(objectSize(component._selectize.optgroups), 2);
});


test('setting initial content with optionGroupPath shows correct number of options and optgroups', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.setProperties({
      optionValuePath: 'content.id',
      optionLabelPath: 'content.title',
      optionGroupPath: 'content.category',
      content: exampleGroupPathContent()
    });
  });
  this.render();
  assert.equal(objectSize(component._selectize.options), 3);
  assert.equal(objectSize(component._selectize.optgroups), 2);
});

test('adding to content with optionGroupPath updates selectize options', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.setProperties({
      optionValuePath: 'content.id',
      optionLabelPath: 'content.title',
      optionGroupPath: 'content.category',
      content: exampleGroupPathContent()
    });
  });
  this.render();
  assert.equal(objectSize(component._selectize.options), 3);
  assert.equal(objectSize(component._selectize.optgroups), 2);

  Ember.run(function() {
    component.get('content').addObject({
      id: 4,
      category: 'Third Group',
      title: 'this title will appear on select'
    });
  });

  assert.equal(objectSize(component._selectize.options), 4);
  assert.equal(objectSize(component._selectize.optgroups), 3);
});

test('removing from content with optionGroupPath updates selectize options', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.setProperties({
      optionValuePath: 'content.id',
      optionLabelPath: 'content.title',
      optionGroupPath: 'content.category',
      content: exampleGroupPathContent()
    });
  });
  this.render();
  assert.equal(objectSize(component._selectize.options), 3);
  assert.equal(objectSize(component._selectize.optgroups), 2);

  Ember.run(function() {
    component.get('content').popObject();
  });

  assert.equal(objectSize(component._selectize.options), 2);
  assert.equal(objectSize(component._selectize.optgroups), 1);
});

test('having a selection creates selectize with a selection', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3']));
    component.set('selection', 'item 2');
  });
  this.render();
  assert.equal(component._selectize.items.length, 1);
  assert.deepEqual(component._selectize.items, ['item 2']);
});

test('having a multiple selection adds remove_button plugin by default', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('multiple', true);
  });
  this.render();
  assert.notEqual(component._selectize.settings.plugins.indexOf('remove_button'), -1);
});

test('not having a multiple selection does not add remove_button plugin by default', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('multiple', false);
  });
  this.render();
  assert.equal(component._selectize.settings.plugins.indexOf('remove_button'), -1);
});

test('having a multiple selection creates selectize with a selection', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3']));
    component.set('selection', Ember.A(['item 2', 'item 3']));
    component.set('multiple', true);
  });
  this.render();
  assert.equal(component._selectize.items.length, 2);
  assert.deepEqual(component._selectize.items, ['item 2', 'item 3']);
});

test('updating a selection updates selectize selection', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3']));
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

test('updating a selection updates selectize value', function(assert) {
  var component = this.subject();
  var content = exampleObjectContent();
  Ember.run(function() {
    component.set('content', content);
    component.set('optionValuePath', 'content.id');
    component.set('optionLabelPath', 'content.label');
    component.set('value', 1);
  });
  this.render();
  assert.equal(component._selectize.getValue(), 1);
  assert.equal(component.get('selection'), content.objectAt(0));
  Ember.run(function() {
    component._selectize.setValue(2);
  });
  assert.equal(component.get('value'), 2);
  assert.equal(component.get('selection'), content.objectAt(1));
});

test('replacing a multiple selection updates selectize selection', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3', 'item 4']));
    component.set('selection', Ember.A(['item 2', 'item 3']));
    component.set('multiple', true);
  });
  this.render();
  assert.equal(component._selectize.items.length, 2);
  assert.deepEqual(component._selectize.items, ['item 2', 'item 3']);
  Ember.run(function() {
    component.set('selection', Ember.A(['item 1', 'item 2', 'item 4']));
  });
  assert.equal(component._selectize.items.length, 3);
  assert.deepEqual(component._selectize.items, ['item 1', 'item 2', 'item 4']);
});

test('adding a multiple selection updates selectize selection', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3', 'item 4']));
    component.set('selection', Ember.A(['item 2', 'item 3']));
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

test('it sends update-filter action when changing filter', function(assert) {
  assert.expect(1);

  var testText = 'dummy text';
  var component = this.subject();
  var targetObject = {
    externalAction: function(query) {
      assert.equal(query, testText, 'externalAction was called with proper argument');
    }
  };

  component.set('update-filter', 'externalAction');
  component.set('targetObject', targetObject);

  Ember.run(function() {
    component._onType(testText);
  });
});

test('it sends create-item action when an item is created in selectize', function(assert) {
  assert.expect(1);

  var testText = 'dummy text';
  var component = this.subject();
  var targetObject = {
    externalAction: function(query) {
      assert.equal(query, testText, 'externalAction was called with proper argument');
    }
  };
  this.render();

  Ember.run(function() {
    component.set('create-item', 'externalAction');
    component.set('targetObject', targetObject);
    component._create(testText, function() {});
  });
});

test('it sends select-item action when an item is selected', function(assert) {
  assert.expect(1);

  var component = this.subject();

  var targetObject = {
    externalAction: function(obj) {
      assert.equal(obj, 'item 3', 'externalAction was called with proper argument');
    }
  };

  Ember.run(function() {
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3', 'item 4']));
    component.set('select-item', 'externalAction');
    component.set('targetObject', targetObject);
  });

  this.render();

  Ember.run(function() {
    component._onItemAdd('item 3');
  });
});

test('it sends select-value action when an item is selected', function(assert) {
  assert.expect(1);

  var component = this.subject();
  var contentArray = exampleObjectContent();

  var targetObject = {
    externalAction: function(value) {
      assert.equal(value, 1);
    }
  };

  Ember.run(function() {
    component.set('content', contentArray);
    component.set('select-value', 'externalAction');
    component.set('targetObject', targetObject);
    component.set('optionValuePath', 'id');
  });

  this.render();

  Ember.run(function() {
    component._onItemAdd('1');
  });
});

test('it sends select-item action when an item is deselected', function(assert) {
  assert.expect(1);

  var component = this.subject();

  var targetObject = {
    externalAction: function(obj) {
      assert.equal(obj, null, 'externalAction was called with proper argument');
    }
  };

  Ember.run(function() {
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3', 'item 4']));
    component.set('selection', 'item 1');
    component.set('select-item', 'externalAction');
    component.set('targetObject', targetObject);
  });

  this.render();

  Ember.run(function() {
    component._onItemRemove('item 1');
  });
});

test('it sends select-value action when an item is deselected', function(assert) {
  assert.expect(1);

  var component = this.subject();
  var contentArray = exampleObjectContent();

  var targetObject = {
    externalAction: function(value) {
      assert.equal(value, null, 'externalAction was called with proper argument');
    }
  };

  Ember.run(function() {
    component.set('content', contentArray);
    component.set('selection', contentArray.objectAt(0));
    component.set('select-value', 'externalAction');
    component.set('targetObject', targetObject);
    component.set('optionValuePath', 'id');
  });

  this.render();

  Ember.run(function() {
    component._onItemRemove('1');
  });
});

test('it sends add-item action when an item is selected in multiple mode', function(assert) {
  assert.expect(1);

  var component = this.subject();

  var targetObject = {
    externalAction: function(obj) {
      assert.equal(obj, 'item 3', 'externalAction was called with proper argument');
    }
  };

  Ember.run(function() {
    component.set('multiple', true);
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3', 'item 4']));
    component.set('selection', Ember.A(['item 2']));
    component.set('add-item', 'externalAction');
    component.set('targetObject', targetObject);
  });

  this.render();

  Ember.run(function() {
    component._onItemAdd('item 3');
  });
});

test('it sends add-value action when an item is selected in multiple mode', function(assert) {
  assert.expect(1);

  var component = this.subject();
  var contentArray = exampleObjectContent();

  var targetObject = {
    externalAction: function(obj) {
      assert.equal(obj, 3, 'externalAction was called with proper argument');
    }
  };

  Ember.run(function() {
    component.set('multiple', true);
    component.set('content', contentArray);
    component.set('selection', Ember.A([contentArray.objectAt(1)]));
    component.set('add-value', 'externalAction');
    component.set('targetObject', targetObject);
    component.set('optionValuePath', 'id');
  });

  this.render();

  Ember.run(function() {
    component._onItemAdd('3');
  });
});

test('it sends remove-item action when an item is deselected in multiple mode', function(assert) {
  assert.expect(1);

  var component = this.subject();
  var contentArray = exampleObjectContent();

  var targetObject = {
    externalAction: function(value) {
      assert.equal(value, 2, 'externalAction was called with proper argument');
    }
  };

  Ember.run(function() {
    component.set('multiple', true);
    component.set('content', contentArray);
    component.set('selection', Ember.A([contentArray.objectAt(1)]));
    component.set('remove-value', 'externalAction');
    component.set('targetObject', targetObject);
    component.set('optionValuePath', 'id');
  });

  this.render();

  Ember.run(function() {
    component._onItemRemove('2');
  });
});

test('it sends remove-value action when an item is deselected in multiple mode', function(assert) {
  assert.expect(1);

  var component = this.subject();

  var targetObject = {
    externalAction: function(obj) {
      assert.equal(obj, 'item 2', 'externalAction was called with proper argument');
    }
  };

  Ember.run(function() {
    component.set('multiple', true);
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3', 'item 4']));
    component.set('selection', Ember.A(['item 2']));
    component.set('remove-item', 'externalAction');
    component.set('targetObject', targetObject);
  });

  this.render();

  Ember.run(function() {
    component._onItemRemove('item 2');
  });
});

test('if label is falsy, don\'t add item', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', exampleObjectContent());
    component.set('optionValuePath', 'id');
    component.set('optionLabelPath', 'unknownLabel');
  });
  this.render();
  assert.deepEqual(asArray(component._selectize.options, 'label'), []);
});

test('if label is falsy, don\'t add item, but add it once label updates', function(assert) {
  var component = this.subject();
  var content = exampleObjectContent();
  Ember.run(function() {
    component.set('content', content);
    component.set('optionValuePath', 'id');
    component.set('optionLabelPath', 'unknownLabel');
  });
  this.render();

  assert.deepEqual(asArray(component._selectize.options, 'label'), []);

  Ember.run(function() {
    content.forEach(function(item, index) {
      item.set('unknownLabel', 'item '+(index+1));
    });
  });

  assert.deepEqual(asArray(component._selectize.options, 'label'), ['item 1', 'item 2', 'item 3']);
});

test('it sends on-init', function(assert) {
  assert.expect(1);

  var component = this.subject();

  var targetObject = {
    externalAction: function() {
      assert.ok(true);
    }
  };

  Ember.run(function() {
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3', 'item 4']));
    component.set('on-init', 'externalAction');
    component.set('targetObject', targetObject);
  });

  this.render();
});

test('having a selection creates selectize with a selection', function(assert) {
  var component = this.subject();
  Ember.run(function() {
    component.set('content', Ember.A(['item 1', 'item 2', 'item 3']));
    component.set('selection', 'item 2');
  });
  this.render();
  assert.equal(component._selectize.items.length, 1);
  assert.deepEqual(component._selectize.items, ['item 2']);
});

test('selection can be set from a Promise when multiple=false', function(assert) {
  assert.expect(2);

  var component = this.subject();

  var yehuda = Ember.Object.create({ id: 1, firstName: 'Yehuda' });
  var tom = Ember.Object.create({ id: 2, firstName: 'Tom' });

  Ember.run(function() {
    component.set('content', Ember.A([yehuda, tom]));
    component.set('multiple', false);
    component.set('optionValuePath', 'id');
    component.set('optionLabelPath', 'firstName');
    component.set('selection', Ember.RSVP.Promise.resolve(tom));
  });

  this.render();

  assert.equal(component._selectize.items.length, 1);
  assert.deepEqual(component._selectize.items, ["2"]);
});

test('changing selection to a promise that resolves to null clears selection', function(assert) {
  assert.expect(4);

  var component = this.subject();

  var yehuda = Ember.Object.create({ id: 1, firstName: 'Yehuda' });
  var tom = Ember.Object.create({ id: 2, firstName: 'Tom' });

  Ember.run(function() {
    component.set('content', Ember.A([yehuda, tom]));
    component.set('multiple', false);
    component.set('optionValuePath', 'id');
    component.set('optionLabelPath', 'firstName');
    component.set('selection', Ember.RSVP.Promise.resolve(tom));
  });

  this.render();

  assert.equal(component._selectize.items.length, 1);
  assert.deepEqual(component._selectize.items, ["2"]);

  Ember.run(function() {
    component.set('selection', Ember.RSVP.Promise.resolve(null));
  });

  assert.equal(component._selectize.items.length, 0);
  assert.deepEqual(component._selectize.items, []);
});

test('selection from a Promise don\'t overwrite newer selection once resolved, when multiple=false', function(assert) {
  assert.expect(1);

  var component = this.subject();

  var yehuda = Ember.Object.create({ id: 1, firstName: 'Yehuda' });
  var tom = Ember.Object.create({ id: 2, firstName: 'Tom' });
  var seb = Ember.Object.create({ id: 3, firstName: 'Seb' });

  var done = assert.async();

  Ember.run(function() {
    component.set('content', Ember.A([yehuda, tom, seb]));
    component.set('optionValuePath', 'id');
    component.set('optionLabelPath', 'firstName');
    component.set('multiple', false);
    component.set('selection', new Ember.RSVP.Promise(function(resolve) {
      Ember.run.later(function() {
        Ember.run(function() {
          resolve(tom);
        });
        assert.deepEqual(component._selectize.items, ["3"], 'Should not select from Promise if newer selection');
        done();
      }, 40);
    }));
    component.set('selection', new Ember.RSVP.Promise(function(resolve) {
      Ember.run.later(function() {
        Ember.run(function() {
          resolve(seb);
        });
      }, 30);
    }));
  });

  this.render();
});

test('content can be set from a Promise', function(assert) {
  assert.expect(3);

  var component = this.subject();

  var yehuda = Ember.Object.create({ id: 1, firstName: 'Yehuda' });
  var tom = Ember.Object.create({ id: 2, firstName: 'Tom' });
  var seb = Ember.Object.create({ id: 3, firstName: 'Seb' });

  Ember.run(function() {
    component.set('optionValuePath', 'id');
    component.set('optionLabelPath', 'firstName');
    component.set('content', Ember.RSVP.Promise.resolve(Ember.A([yehuda, tom, seb])));

    component.set('selection', tom);
  });

  this.render();

  assert.equal(objectSize(component._selectize.options), 3);

  assert.equal(component._selectize.items.length, 1);
  assert.deepEqual(component._selectize.items, ["2"]);

});

test('content from a Promise don\'t overwrite newer content once resolved', function(assert) {
  assert.expect(3);

  var component = this.subject();

  var yehuda = Ember.Object.create({ id: 1, firstName: 'Yehuda' });
  var tom = Ember.Object.create({ id: 2, firstName: 'Tom' });
  var seb = Ember.Object.create({ id: 3, firstName: 'Seb' });

  var done = assert.async();

  Ember.run(function() {
    component.set('optionValuePath', 'id');
    component.set('optionLabelPath', 'firstName');
    component.set('content', new Ember.RSVP.Promise(function(resolve) {
      Ember.run.later(function() {
        Ember.run(function() {
          resolve(Ember.A([yehuda, tom, seb]));
        });
        assert.equal(objectSize(component._selectize.options), 2, 'Should have 2 options and not 3');

        assert.equal(component._selectize.items.length, 1);
        assert.deepEqual(component._selectize.items, ["2"]);
        done();
      }, 40);
    }));

    component.set('content', new Ember.RSVP.Promise(function(resolve) {
      Ember.run.later(function() {
        Ember.run(function() {
          resolve(Ember.A([yehuda, tom]));
        });
      }, 30);
    }));

    component.set('selection', tom);
  });

  this.render();

});

test('renders components', function(assert) {

  this.register('component:foo-bar', Ember.Component.extend({}));
  this.register('template:components/foo-bar', hbs`Hi, {{data.firstName}}!`);

  var yehuda = Ember.Object.create({ id: 1, firstName: 'Yehuda' });
  var tom = Ember.Object.create({ id: 2, firstName: 'Tom' });
  var seb = Ember.Object.create({ id: 3, firstName: 'Seb' });

  var component = this.subject();

  Ember.run(function() {
    component.set('optionComponent', 'foo-bar');
    component.set('optionValuePath', 'id');
    component.set('optionLabelPath', 'firstName');
    component.set('content', Ember.A([yehuda, tom, seb]));
    component.set('selection', tom);
  });

  this.render();

  assert.deepEqual(component._selectize.items, ["2"]);
  assert.equal(component._selectize.$dropdown_content.children().length, 3);
  assert.equal(component._selectize.$dropdown_content.children().text(), 'Hi, Yehuda!Hi, Tom!Hi, Seb!');

  Ember.run(() => {
    component.set('content.firstObject.firstName', 'Miguel');
  });

  assert.equal(component._selectize.$dropdown_content.children().text(), 'Hi, Miguel!Hi, Tom!Hi, Seb!', 'It rerenders!');
});

test('renders function', function(assert) {

  var yehuda = Ember.Object.create({ id: 1, firstName: 'Yehuda' });
  var tom = Ember.Object.create({ id: 2, firstName: 'Tom' });
  var seb = Ember.Object.create({ id: 3, firstName: 'Seb' });

  var component = this.subject();

  Ember.run(function() {
    component.set('optionFunction', function(data) {
      assert.equal(arguments.length, 2, 'arguments length');
      return `<div>Hi, ${data.get('firstName')}!</div>`;
    });
    component.set('optionValuePath', 'id');
    component.set('optionLabelPath', 'firstName');
    component.set('content', Ember.A([yehuda, tom, seb]));
    component.set('selection', tom);
  });

  this.render();

  assert.deepEqual(component._selectize.items, ["2"]);
  assert.equal(component._selectize.$dropdown_content.children().length, 3);
  assert.equal(component._selectize.$dropdown_content.children().text(), 'Hi, Yehuda!Hi, Tom!Hi, Seb!');

});
