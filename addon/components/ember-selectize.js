import Ember from 'ember';
import computed from 'ember-new-computed';
var get = Ember.get, isArray = Ember.isArray, typeOf = Ember.typeOf,
  isNone = Ember.isNone, camelize = Ember.String.camelize;

/**
 * Ember.Selectize is an Ember View that encapsulates a Selectize component.
 * The goal is to use this as a near dropin replacement for Ember.Select.
 */
export default Ember.Component.extend({
  attributeBindings: ['multiple', 'autocomplete', 'required'],
  classNames: ['ember-selectize'],

  autocomplete: 'off',
  multiple: false,
  maxItems: Ember.computed('multiple', function() {
    return this.get('multiple') ? null : 1;
  }),
  // Allows to use prompt (like in Ember.Select) or placeholder property
  placeholder: Ember.computed.alias('prompt'),
  sortField: null,
  sortDirection: 'asc',
  tagName: 'select',

  /**
  * overrideable object paths for value and label paths
  */
  optionValuePath: 'content',
  optionLabelPath: 'content',

  selection: null,
  value: computed('selection', {get: function() {
    var valuePath = this.get('_valuePath');
    return valuePath ? this.get('selection.' + valuePath) : this.get('selection');
  }, set: function(key, value){ return value; }}),

  /**
  * The array of the default plugins to load into selectize
  */
  plugins: ['remove_button'],

  /**
  * Computed properties that hold the processed paths ('content.' replacement),
  * as it is done on Ember.Select
  */
  _valuePath: computed('optionValuePath', function() {
    return this.get('optionValuePath').replace(/^content\.?/, '');
  }),
  _labelPath: computed('optionLabelPath', function() {
    return this.get('optionLabelPath').replace(/^content\.?/, '');
  }),

  /**
  * Loading feature default values.
  * If you want to override the css class that is applied, change the `loadingClass` property.
  */
  loading: false,
  loadingClass: 'loading',

  /**
  * The render function names selectize expects.
  * We will use these to automatically infer the properties with the template and view names.
  */
  functionNames: ['option', 'item', 'option_create', 'optgroup_header', 'optgroup'],
  templateSuffix: 'Template',
  viewSuffix: 'View',
  functionSuffix: 'Function',
  renderOptions: computed(function() {
    var functionNames = this.get('functionNames');
    //this hash will contain the render functions
    var renderFunctions = {};

    functionNames.forEach(function(item) {
      // infer the function name by camelizing selectize's function and appending the function suffix (overridable)
      var functionSuffix = this.get('functionSuffix');
      var functionPropertyName = camelize(item) + functionSuffix;
      var renderFunction = this.get(functionPropertyName);
      // functions take precedence
      if (renderFunction) {
        renderFunctions[item] = renderFunction.bind(this.get('targetObject'));
      } else {
        // infer the view name by camelizing selectize's function and appending a view suffix (overridable)
        var templateSuffix = this.get('templateSuffix');
        var viewSuffix = this.get('viewSuffix');
        var viewPropertyName = camelize(item) + viewSuffix;
        var viewToRender = this.get(viewPropertyName);

        var _this = this;
        if (viewToRender) {
          // we have a view to render. set the function.
          renderFunctions[item] = function(data) {
            return _this._viewToString(viewToRender, data.data);
          };
        } else {
          // there isn't a view to render. try to get a template.
          // infer the template name by camelizing selectize's function and appending a template suffix (overridable)
          var templatePropertyName = camelize(item) + templateSuffix;
          var templateToRender = this.get(templatePropertyName);

          if (templateToRender) {
            // we have a template to render. set the function.
            renderFunctions[item] = function(data) {
              return _this._templateToString(templateToRender, data.data);
            };
          }
        }
      }
    }, this);

    return renderFunctions;
  }),

  selectizeOptions: computed(function() {
    var allowCreate = this.get('create-item');

    //Split the passed in plugin config into an array.
    if (typeof this.plugins === 'string') {
      this.plugins = this.plugins === '' ? [] : this.plugins.split(', ').map(function(item) { return item.trim(); });
    }

    var options = {
      plugins: this.plugins,
      labelField: 'label',
      valueField: 'value',
      searchField: 'label',
      create: allowCreate ? Ember.run.bind(this, '_create') : false,
      onItemAdd: Ember.run.bind(this, '_onItemAdd'),
      onItemRemove: Ember.run.bind(this, '_onItemRemove'),
      onType: Ember.run.bind(this, '_onType'),
      render: this.get('renderOptions'),
      placeholder: this.get('placeholder')
    };

    var generalOptions = ['delimiter', 'diacritics', 'createOnBlur',
                          'createFilter', 'highlight', 'persist', 'openOnFocus',
                          'maxOptions', 'maxItems', 'hideSelected',
                          'closeAfterSelect', 'allowEmptyOption',
                          'scrollDuration', 'loadThrottle', 'preload',
                          'dropdownParent', 'addPrecedence', 'selectOnTab'];

    var self = this;

    generalOptions.forEach(function(option) {
      options[option] = self.get(option);
    });

    options = this._mergeSortField(options);

    return options;
  }),

  didInsertElement: function() {
    //Create Selectize's instance
    this.$().selectize(this.get('selectizeOptions'));

    //Save the created selectize instance
    this._selectize = this.$()[0].selectize;

    //Some changes to content, selection and disabled could have happened before the Component was inserted into the DOM.
    //We trigger all the observers manually to account for those changes.
    this._disabledDidChange();
    this._contentDidChange();

    var selection = this.get('selection');
    var value = this.get('value');
    if (!isNone(selection)) { this._selectionDidChange(); }
    if (!isNone(value)) { this._valueDidChange(); }

    this._loadingDidChange();
  },
  willDestroyElement: function() {
    //Unbind observers
    this._contentWillChange();
    this._selectionWillChange();

    //Invoke Selectize's destroy
    this._selectize.destroy();

    //We are no longer in DOM
    this._selectize = null;
  },
  /**
  * Event callback that is triggered when user creates a tag
  */
  _create: function(input, callback) {
    // Delete user entered text
    this._selectize.setTextboxValue('');
    // Send create action

    // allow the observers and computed properties to run first
    Ember.run.schedule('actions', this, function() {
      this.sendAction('create-item', input);
    });
    // We cancel the creation here, so it's up to you to include the created element
    // in the content and selection property
    callback(null);
  },
  /**
  * Event callback that is triggered when user types in the input element
  */
  _onType: function(str) {
    this.set('filter', str);
    Ember.run.schedule('actions', this, function() {
      this.sendAction('update-filter', str);
    });
  },
  /**
  * Event callback triggered when an item is added (when something is selected)
  * Here we need to update our selection property (if single selection) or array (if multiple selection)
  * We also send an action
  */
  _onItemAdd: function(value) {
    var content = this.get('content');
    var selection = this.get('selection');
    var multiple = this.get('multiple');
    if (content) {
      var obj = content.find(function(item) {
        return (get(item, this.get('_valuePath')) + '') === value;
      }, this);
      if (multiple && isArray(selection) && obj) {
        if (!selection.findBy(this.get('_valuePath'), get(obj, this.get('_valuePath')))) {
          this._addSelection(obj);
        }
      } else if (obj) {
        if (!selection || (get(obj, this.get('_valuePath')) !== get(selection, this.get('_valuePath')))) {
          this._updateSelection(obj);
        }
      }
    }
  },
  /**
  * Event callback triggered when an item is removed (when something is deselected)
  * Here we need to update our selection property (if single selection, here set to null) or remove item from array (if multiple selection)
  */
  _onItemRemove: function(value) {
    //in order to know if this event was triggered by observers or if it came from user interaction
    if (this._removing) {
      return;
    }
    var content = this.get('content');
    var selection = this.get('selection');
    var multiple = this.get('multiple');
    if (content) {
      var obj = content.find(function(item) {
        return get(item, this.get('_valuePath')) + '' === value;
      }, this);
      if (multiple && isArray(selection) && obj) {
        this._removeSelection(obj);
      } else if (!multiple) {
        this._updateSelection(null);
      }
    }
  },

 /**
  * Update the selection value and send main action
  */
  _updateSelection: function(selection) {
    this.set('selection', selection);

    // allow the observers and computed properties to run first
    Ember.run.schedule('actions', this, function() {
      var value = this.get('value');
      this.sendAction('select-item', selection, value);
    });
  },
  _addSelection: function(obj) {
    this.get('selection').addObject(obj);

    Ember.run.schedule('actions', this, function() {
      this.sendAction('add-item', obj);
    });
  },
  _removeSelection: function(obj) {
    this.get('selection').removeObject(obj);

    Ember.run.schedule('actions', this, function() {
      this.sendAction('remove-item', obj);
    });
  },
  /**
  * Ember observer triggered before the selection property is changed
  * We need to unbind any array observers if we're in multiple selection
  */
  _selectionWillChange: Ember.beforeObserver(function() {
    var multiple = this.get('multiple');
    var selection = this.get('selection');
    if (selection && isArray(selection) && multiple) {
      selection.removeArrayObserver(this,  {
        willChange: 'selectionArrayWillChange',
        didChange: 'selectionArrayDidChange'
      });
      var len = selection ? get(selection, 'length') : 0;
      this.selectionArrayWillChange(selection, 0, len);
    }
  }, 'selection'),
  /**
  * Ember observer triggered when the selection property is changed
  * We need to bind an array observer when selection is multiple
  */
  _selectionDidChange: Ember.observer(function() {
    if (!this._selectize) {
      return;
    }
    var multiple = this.get('multiple');
    var selection = this.get('selection');
    if (multiple) {
      if (selection) {
        //Normalize selection to an array
        if (!isArray(selection)) {
          selection = Ember.A([selection]);
          this.set('selection', selection);
          return;
        }
        //bind array observers to listen for selection changes
        selection.addArrayObserver(this, {
          willChange: 'selectionArrayWillChange',
          didChange: 'selectionArrayDidChange'
        });
      } else {
        //selection was changed to nothing
        this.set('selection', Ember.A());
        return;
      }
      //Trigger a selection change that will update selectize with the new selection
      var len = selection ? get(selection, 'length') : 0;
      this.selectionArrayDidChange(selection, 0, null, len);
    } else {
      if (selection) {
        //select item in selectize
        this._selectize.addItem(get(selection, this.get('_valuePath')));
      } else {
        //selection was changed to a falsy value. Clear selectize.
        if (this._selectize) {
          this._selectize.clear();
          this._selectize.showInput();
        }
      }
    }
  }, 'selection'),

  /**
   * It is possible to control the selected item through its value.
   */
  _valueDidChange: Ember.observer('value', function() {
    var content = this.get('content');
    var value = this.get('value');
    var valuePath = this.get('_valuePath');
    var selectedValue = (valuePath ? this.get('selection.' + valuePath) : this.get('selection'));
    var selection;

    if (value !== selectedValue) {
      selection = content ? content.find(function(obj) {
        return value === (valuePath ? get(obj, valuePath) : obj);
      }) : null;

      this.set('selection', selection);
    }
  }),

  /*
  * Triggered before the selection array changes
  * Here we process the removed elements
  */
  selectionArrayWillChange: function(array, idx, removedCount) {
    this._removing = true;
    for (var i = idx; i < idx + removedCount; i++) {
      this.selectionObjectWasRemoved(array.objectAt(i));
    }
    this._removing = false;
  },
  /*
  * Triggered after the selection array changes
  * Here we process the inserted elements
  */
  selectionArrayDidChange: function(array, idx, removedCount, addedCount) {
    for (var i = idx; i < idx + addedCount; i++) {
      this.selectionObjectWasAdded(array.objectAt(i), i);
    }
  },
  /*
  * Function that is responsible for Selectize's item inserting logic
  */
  selectionObjectWasAdded: function(obj) {
    if (this._selectize) {
      this._selectize.addItem(get(obj, this.get('_valuePath')));
    }
  },
  /*
  * Function that is responsible for Selectize's item removing logic
  */
  selectionObjectWasRemoved: function(obj) {
    if (this._selectize) {
      this._selectize.removeItem(get(obj, this.get('_valuePath')));
    }
  },
  /**
  * Ember observer triggered before the content property is changed
  * We need to unbind any array observers
  */
  _contentWillChange: Ember.beforeObserver(function() {
    if (!this._selectize) {
      return;
    }
    var content = this.get('content');
    if (content) {
      content.removeArrayObserver(this, {
        willChange: 'contentArrayWillChange',
        didChange: 'contentArrayDidChange'
      });
    }
    //Trigger remove logic
    var len = content ? get(content, 'length') : 0;
    this._removing = true;
    this.contentArrayWillChange(content, 0, len);
    this._removing = false;
    this._selectionDidChange();
  }, 'content'),
  /**
  * Ember observer triggered when the content property is changed
  * We need to bind an array observer to become notified of its changes
  */
  _contentDidChange: Ember.observer(function() {
    if (!this._selectize) {
      return;
    }
    var content = this.get('content');
    if (content) {
      content.addArrayObserver(this, {
        willChange: 'contentArrayWillChange',
        didChange: 'contentArrayDidChange'
      });
    }
    var len = content ? get(content, 'length') : 0;
    this.contentArrayDidChange(content, 0, null, len);
  }, 'content'),
  /*
  * Triggered before the content array changes
  * Here we process the removed elements
  */
  contentArrayWillChange: function(array, idx, removedCount) {
    for (var i = idx; i < idx + removedCount; i++) {
      this.objectWasRemoved(array.objectAt(i));
    }

    if (this._selectize) {
      this._selectize.refreshOptions(this._selectize.isFocused && !this._selectize.isInputHidden);
    }

    this._selectionDidChange();
  },
  /*
  * Triggered after the content array changes
  * Here we process the inserted elements
  */
  contentArrayDidChange: function(array, idx, removedCount, addedCount) {
    for (var i = idx; i < idx + addedCount; i++) {
      this.objectWasAdded(array.objectAt(i));
      this.addLabelObserver(array.objectAt(i));
    }

    if (this._selectize) {
      this._selectize.refreshOptions(this._selectize.isFocused && !this._selectize.isInputHidden);
    }

    this._selectionDidChange();
  },
  /*
  * Function that is responsible for Selectize's option inserting logic
  * If the option is an object or Ember instance, we set an observer on the label value of it.
  * This way, we can later update the label of it.
  * Useful for dealing with objects that 'lazy load' some properties/relationships.
  */
  objectWasAdded: function(obj) {
    var data = {};
    var sortField = this.get('sortField');

    if (typeOf(obj) === 'object' || typeOf(obj) === 'instance') {
      data = {
        label: get(obj, this.get('_labelPath')),
        value: get(obj, this.get('_valuePath')),
        data: obj
      };

      if (sortField) {
        if (isArray(sortField)) {
          sortField.forEach(function(field) {
            data[field.field] = get(obj, field.field);
          });
        } else {
          data[sortField] = get(obj, sortField);
        }
      }

    } else {
      data = {
        label: obj,
        value: obj,
        data: obj
      };

      if (sortField && !isArray(sortField)) {
        data[sortField] = obj;
      }
    }

    if (this._selectize && data.label) {
      this._selectize.addOption(data);
    }
  },
  addLabelObserver: function(obj) {
    //Only attach observer if the label is a property of an object
    if (typeOf(obj) === 'object' || typeOf(obj) === 'instance') {
      Ember.addObserver(obj, this.get('_labelPath'), this, '_labelDidChange');
    }
  },
  /*
  * Function that is responsible for Selectize's option removing logic
  */
  objectWasRemoved: function(obj) {
    if (typeOf(obj) === 'object' || typeOf(obj) === 'instance') {
      Ember.removeObserver(obj, this.get('_labelPath'), this, '_labelDidChange');
    }
    if (this._selectize) {
      this._selectize.removeOption(get(obj, this.get('_valuePath')));
    }
  },
  /*
  * Ember Observer that triggers when an option's label changes.
  * Here we need to update its corresponding option with the new data
  */
  _labelDidChange: function(sender) {
    if (!this._selectize) { return; }
    var data = {
      label: get(sender, this.get('_labelPath')),
      value: get(sender, this.get('_valuePath')),
      data: sender
    };

    if(this._selectize.getOption(data.value).length !== 0) {
      this._selectize.updateOption(data.value, data);
    } else {
      this.objectWasAdded(sender);
    }
  },
  /*
  * Observer on the disabled property that enables or disables selectize.
  */
  _disabledDidChange: Ember.observer(function() {
    if (!this._selectize) { return; }
    var disable = this.get('disabled');
    if (disable) {
      this._selectize.disable();
    } else {
      this._selectize.enable();
    }
  }, 'disabled'),
  /*
  * Observer on the placeholder property that updates selectize's placeholder.
  */
  _placeholderDidChange: Ember.observer(function() {
    if (!this._selectize) { return; }
    var placeholder = this.get('placeholder');
    this._selectize.settings.placeholder = placeholder;
    this._selectize.updatePlaceholder();
  }, 'placeholder'),
  /*
  * Observer on the loading property.
  * Here we add/remove a css class, similarly to how selectize does.
  */
  _loadingDidChange: Ember.observer(function() {
    var loading = this.get('loading');
    var loadingClass = this.get('loadingClass');
    if (loading) {
      this._selectize.$wrapper.addClass(loadingClass);
    } else {
      this._selectize.$wrapper.removeClass(loadingClass);
    }
  }, 'loading'),

  _templateToString: function(templateName, data) {
    var template = this.container.lookup('template:' + templateName);

    if (!template) {
      throw new TypeError('template ' + templateName + ' does not exist.');
    }

    var controller = Ember.Controller.create(Ember.typeOf(data) === 'instance' ? data : {data: data});
    var view = this.createChildView(Ember.View, {
      template: template,
      controller: controller,
      container: this.get('container')
    });

    return this._getStringFromView(view);
  },
  _viewToString: function(viewName, data) {
    var viewClass = this.container.lookup('view:' + viewName);

    if (!viewClass) {
      throw new TypeError('view ' + viewName + ' does not exist.');
    }

    var controller = Ember.Controller.create(Ember.typeOf(data) === 'instance' ? data : {data: data});
    var view = this.createChildView(viewClass, {
      controller: controller
    });

    return this._getStringFromView(view);
  },
  /*
  * Encapsulates the logic of converting a view to a string
  */
  //FIX ME: this method does not work in Ember 1.8.0
  //see http://git.io/VUYZ4g for more info
  _getStringFromView: function(view) {
    view.createElement();
    return view.element.outerHTML;
  },

  _mergeSortField: function(options) {
    var sortField = this.get('sortField');
    if (sortField) {
      var sortArray = this._getSortArray(sortField);
      Ember.merge(options, { sortField: sortArray });
    }
    return options;
  },

  _getSortArray: function(sortField) {
    if (isArray(sortField)) {
      return sortField;
    } else {
      return [{
        field: sortField,
        direction: this.get('sortDirection')
      }];
    }
  }
});
