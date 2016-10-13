import Ember from 'ember';
import computedPolyfill from 'ember-new-computed';
import getOwner from 'ember-getowner-polyfill';

const {
  Component,
  computed,
  observer,
  run,
  get,
  isArray,
  isEmpty,
  isNone,
  typeOf,
  String: { camelize },
  assert
} = Ember;
const assign = Ember.assign || Ember.merge;

/**
 * Ember.Selectize is an Ember View that encapsulates a Selectize component.
 * The goal is to use this as a near dropin replacement for Ember.Select.
 */
export default Component.extend({
  attributeBindings: ['name', 'multiple', 'autocomplete', 'required', 'tabindex'],
  classNames: ['ember-selectize'],

  autocomplete: 'off',
  multiple: false,
  tabindex: 0,
  maxItems: computed('multiple', function() {
    return this.get('multiple') ? null : 1;
  }),

  // Allows to use prompt (like in Ember.Select) or placeholder property
  placeholder: computed.alias('prompt'),
  sortField: null,
  sortDirection: 'asc',
  tagName: 'select',

  /**
  * overrideable object paths for value and label paths
  */
  optionValuePath: 'content',
  optionLabelPath: 'content',
  optionGroupPath: 'content.group',

  selection: null,
  value: computedPolyfill('selection', {
    get() {
      var valuePath = this.get('_valuePath');
      var selection = this.get('selection');
      return valuePath && selection ? Ember.get(selection, valuePath) : selection;
    },
    set(key, value) {
      return value;
    }
  }),

  /*
   * Contains optgroups.
   */
  optgroups: computed('content.[]', 'groupedContent.[]', function() {
    var groupedContent = this.get('groupedContent');
    if (groupedContent) {
      return groupedContent.mapBy('label');
    } else {
      //compute option groups from content
      var content = this.get('content');
      if (!isArray(content)) { return; }

      return content.reduce((previousValue, item) => {
        return previousValue.addObject(get(item, this.get('_groupPath')));
      }, Ember.A());
    }
  }),
  /**
   * Computes content from grouped content.
   * If `content` is set, this computed property is overriden and never executed.
   */
  content: computed('groupedContent.[]', function() {
    var groupedContent = this.get('groupedContent');

    if (!groupedContent) { return; }

    //concatenate all content properties in each group
    return groupedContent.reduce((previousValue, group) => {
      var content = get(group, 'content') || Ember.A();
      var groupLabel = get(group, 'label');

      //create proxies for each object. Selectize requires the group value to be
      //set in the object. Use ObjectProxy to keep original object intact.
      var proxiedContent = content.map(item => {
        var proxy = { content: item };
        proxy[this.get('_groupPath')] = groupLabel;
        return Ember.ObjectProxy.create(proxy);
      });

      return previousValue.pushObjects(proxiedContent);
    }, Ember.A());
  }),


  _optgroupsDidChange: observer('optgroups.[]', function() {
    if (!this._selectize) {
      return;
    }
    //TODO right now we reset option groups.
    //Ideally we would set up an array observer and use selectize's [add|remove]OptionGroup
    this._selectize.clearOptionGroups();
    var optgroups = this.get('optgroups');
    if (!optgroups) { return; }

    optgroups.forEach(group => {
      this._selectize.addOptionGroup(group, { label: group, value: group});
    });
  }),

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
  _groupPath: computed('optionGroupPath', function() {
    return this.get('optionGroupPath').replace(/^content\.?/, '');
  }),

  getValueFor(item) {
    let valuePath = this.get('_valuePath');
    return isEmpty(valuePath) || isEmpty(item) ? item : get(item, valuePath);
  },

  getLabelFor(item) {
    let labelPath = this.get('_labelPath');
    return isEmpty(labelPath) || isEmpty(item) ? item : get(item, labelPath);
  },

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
  componentSuffix: 'Component',
  functionSuffix: 'Function',
  renderOptions: computed(function() {
    var functionNames = this.get('functionNames');
    //this hash will contain the render functions
    var renderFunctions = {};

    functionNames.forEach(item => {
      // infer the function name by camelizing selectize's function and appending the function suffix (overridable)
      var functionSuffix = this.get('functionSuffix');
      var functionPropertyName = camelize(item) + functionSuffix;
      var renderFunction = this.get(functionPropertyName);
      // functions take precedence
      if (renderFunction) {
        renderFunctions[item] = (data, escape) => {
          return renderFunction.call(this.get('targetObject') || this, data.data || data, escape);
        };
      } else {
        // infer the view name by camelizing selectize's function and appending a view suffix (overridable)
        var componentSuffix = this.get('componentSuffix');
        var componentPropertyName = camelize(item) + componentSuffix;
        var componentToRender = this.get(componentPropertyName);

        if (componentToRender) {
          // we have a view to render. set the function.
          renderFunctions[item] = data => {
            return this._componentToDOM(componentToRender, data.data || data);
          };
        }
      }
    });

    return renderFunctions;
  }),

  selectizeOptions: computed(function() {
    var allowCreate = this.get('create-item');
    var multiple = this.get('multiple');

    //Split the passed in plugin config into an array.
    if (typeof this.plugins === 'string') {
      this.plugins = this.plugins.trim().split(/[\s,]+/);
    }

    var plugins = this.plugins.slice(0);

    if (!multiple) {
      var index = plugins.indexOf('remove_button');
      plugins.splice(index, 1);
    }

    var options = {
      plugins: plugins,
      labelField: 'label',
      valueField: 'value',
      searchField: 'label',
      optgroupField: 'optgroup',
      create: allowCreate ? run.bind(this, '_create') : false,
      onItemAdd: run.bind(this, '_onItemAdd'),
      onItemRemove: run.bind(this, '_onItemRemove'),
      onType: run.bind(this, '_onType'),
      render: this.get('renderOptions'),
      placeholder: this.get('placeholder'),
      score: this.get('score'),
      onBlur: this._registerAction('on-blur'),
      onFocus: this._registerAction('on-focus'),
      onInitialize: this._registerAction('on-init'),
      onClear: this._registerAction('on-clear')
    };

    var generalOptions = ['delimiter', 'diacritics', 'createOnBlur',
                          'createFilter', 'highlight', 'persist', 'openOnFocus',
                          'maxOptions', 'maxItems', 'hideSelected',
                          'closeAfterSelect', 'allowEmptyOption',
                          'scrollDuration', 'loadThrottle', 'preload',
                          'dropdownParent', 'addPrecedence', 'selectOnTab',
                          'searchField'];

    generalOptions.forEach((option) => {
      options[option] = this.getWithDefault(option, options[option]);
    });

    options = this._mergeSortField(options);

    return options;
  }),

  didInsertElement() {
    // ensure selectize is loaded
    assert('selectize has to be loaded', typeof this.$().selectize === 'function');

    //Create Selectize's instance
    this.$().selectize(this.get('selectizeOptions'));

    //Save the created selectize instance
    this._selectize = this.$()[0].selectize;

    //Some changes to content, selection and disabled could have happened before the Component was inserted into the DOM.
    //We trigger all the observers manually to account for those changes.
    this._disabledDidChange();
    this._optgroupsDidChange();
    if(this.get('groupedContent')) {
      this._groupedContentDidChange();
    }
    this._contentDidChange();

    var selection = this.get('selection');
    var value = this.get('value');
    if (!isNone(selection)) { this._selectionDidChange(); }
    if (!isNone(value)) { this._valueDidChange(); }

    this._loadingDidChange();
  },

  willDestroyElement() {
    //Unbind observers
    this._contentWillChange(this.get('content'));
    this._selectionWillChange(this.get('selection'));
    this._groupedContentWillChange(this.get('groupedContent'));

    //Invoke Selectize's destroy
    this._selectize.destroy();

    //We are no longer in DOM
    this._selectize = null;
  },

  /**
  * Event callback that is triggered when user creates a tag
  */
  _create(input, callback) {
    // Delete user entered text
    this._selectize.setTextboxValue('');
    // Send create action

    // allow the observers and computed properties to run first
    run.schedule('actions', this, function() {
      this.sendAction('create-item', input);
    });
    // We cancel the creation here, so it's up to you to include the created element
    // in the content and selection property
    callback(null);
  },

  /**
  * Event callback for DOM events
  */
  _registerAction(action){
    return run.bind(this, function() {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(action);
      this.sendAction.apply(this, args);
    });
  },

  /**
  * Event callback that is triggered when user types in the input element
  */
  _onType(str) {
    this.set('filter', str);
    run.schedule('actions', this, function() {
      this.sendAction('update-filter', str);
    });
  },

  /**
  * Event callback triggered when an item is added (when something is selected)
  * Here we need to update our selection property (if single selection) or array (if multiple selection)
  * We also send an action
  */
  _onItemAdd(value) {
    var content = this.get('content');
    var selection = this.get('selection');
    var multiple = this.get('multiple');
    if (content) {
      var obj = content.find(function(item) {
        return (this.getValueFor(item) + '') === value;
      }, this);
      if (multiple && isArray(selection) && obj) {
        let selected = selection.find((item) => {
          return isEmpty(this.get('_valuePath')) ? item === obj : this.getValueFor(obj) === this.getValueFor(item);
        });
        if (!selected) {
          this._addSelection(obj);
        }

      } else if (obj) {
        if (!selection || (this.getValueFor(obj) !== this.getValueFor(selection))) {
          this._updateSelection(obj);
        }
      }
    }
  },

  /**
  * Event callback triggered when an item is removed (when something is deselected)
  * Here we need to update our selection property (if single selection, here set to null) or remove item from array (if multiple selection)
  */
  _onItemRemove(value) {
    //in order to know if this event was triggered by observers or if it came from user interaction
    if (this._removing) { return; }

    var content = this.get('content');
    var selection = this.get('selection');
    var multiple = this.get('multiple');
    if (content) {
      var obj = content.find(function(item) {
        return this.getValueFor(item) + '' === value;
      }, this);
      if (multiple && isArray(selection) && obj) {
        this._removeSelection(obj);
      } else if (!multiple) {
        this._updateSelection(null);
      }
    }
  },

 /**
  * Update the selection value and send main actions
  * In addition to emitting the selection object, a selection value is sent via `select-value` based on `optionValuePath`
  */
  _updateSelection(selection) {
    this.set('selection', selection);

    // allow the observers and computed properties to run first
    run.schedule('actions', this, function() {
      var value = this.get('value');
      this.sendAction('select-item', selection, value);
      this.sendAction('select-value', value);
    });
  },

  _addSelection(obj) {
    let val = this.getValueFor(obj);

    this.get('selection').addObject(obj);

    run.schedule('actions', this, function() {
      this.sendAction('add-item', obj);
      this.sendAction('add-value', val);
    });
  },

  _removeSelection(obj) {
    let val = this.getValueFor(obj);

    this.get('selection').removeObject(obj);

    run.schedule('actions', this, function() {
      this.sendAction('remove-item', obj);
      this.sendAction('remove-value', val);
    });
  },

  /**
  * Ember observer triggered before the selection property is changed
  * We need to unbind any array observers if we're in multiple selection
  */
  _selectionWillChange(selection) {
    var multiple = this.get('multiple');
    if (selection && isArray(selection) && multiple) {
      selection.removeArrayObserver(this,  {
        willChange: 'selectionArrayWillChange',
        didChange: 'selectionArrayDidChange'
      });
      var len = selection ? get(selection, 'length') : 0;
      this.selectionArrayWillChange(selection, 0, len);
    }
  },
  /**
  * Ember observer triggered when the selection property is changed
  * We need to bind an array observer when selection is multiple
  */
  _selectionDidChange: observer('selection', function() {

    var selection = this.get('selection');
    if (this._oldSelection !== selection) {
      this._selectionWillChange(this._oldSelection);
      this._oldSelection = selection;
    }

    if (!this._selectize) { return; }

    var multiple = this.get('multiple');

    if (selection) {
      if (multiple) {
        assert('When ember-selectize is in multiple mode, the provided selection must be an array.', isArray(selection));
        //bind array observers to listen for selection changes
        selection.addArrayObserver(this, {
          willChange: 'selectionArrayWillChange',
          didChange: 'selectionArrayDidChange'
        });
        //Trigger a selection change that will update selectize with the new selection
        var len = selection ? get(selection, 'length') : 0;
        this.selectionArrayDidChange(selection, 0, null, len);
      } else {
        if (selection.then) {
          selection.then(resolved => {
            if (resolved) {
              // Ensure that we don't overwrite new value
              if (get(this, 'selection') === selection) {
                this._selectize.addItem(this.getValueFor(resolved));
              }
            } else {
              //selection was changed to a falsy value. Clear selectize.
              this._selectize.clear();
              this._selectize.showInput();
            }
          });
        } else {
          this._selectize.addItem(this.getValueFor(selection));
        }

      }

    } else {
      //selection was changed to a falsy value. Clear selectize.
      this._selectize.clear();
      this._selectize.showInput();
    }
  }),

  /**
   * It is possible to control the selected item through its value.
   */
  _valueDidChange: observer('value', function() {
    var content = this.get('content');
    var value = this.get('value');
    var selectedValue = this.getValueFor(this.get('selection'));
    var selection;

    if (value !== selectedValue) {
      selection = content ? content.find((obj) => {
        return value === this.getValueFor(obj);
      }) : null;

      this.set('selection', selection);
    }
  }),

  /*
  * Triggered before the selection array changes
  * Here we process the removed elements
  */
  selectionArrayWillChange(array, idx, removedCount) {
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
  selectionArrayDidChange(array, idx, removedCount, addedCount) {
    for (var i = idx; i < idx + addedCount; i++) {
      this.selectionObjectWasAdded(array.objectAt(i), i);
    }
  },

  /*
  * Function that is responsible for Selectize's item inserting logic
  */
  selectionObjectWasAdded(obj) {
    if (this._selectize) {
      this._selectize.addItem(this.getValueFor(obj));
    }
  },

  /*
  * Function that is responsible for Selectize's item removing logic
  */
  selectionObjectWasRemoved(obj) {
    if (this._selectize) {
      this._selectize.removeItem(this.getValueFor(obj));
    }
  },

  /**
  * Ember observer triggered before the content property is changed
  * We need to unbind any array observers
  */
  _contentWillChange(content) {
    if (!this._selectize) { return; }
    if (isArray(content)) {
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
  },

  /**
  * Ember observer triggered when the content property is changed
  * We need to bind an array observer to become notified of its changes
  */
  _contentDidChange: observer('content', function() {
    var content = this.get('content');
    if (this._oldContent !== content) {
      this._contentWillChange(this._oldContent);
      this._oldContent = content;
    }

    if (!this._selectize) { return; }

    if (isArray(content)) {
      content.addArrayObserver(this, {
        willChange: 'contentArrayWillChange',
        didChange: 'contentArrayDidChange'
      });
    } else if(content && content.then) {
      content.then(resolved => {
        // Ensure that we don't overwrite new value
        if (get(this, 'content') === content) {
          this.set('content', resolved);
        }
      });
    }
    var len = content ? get(content, 'length') : 0;
    this.contentArrayDidChange(content, 0, null, len);
  }),

  /*
  * Triggered before the content array changes
  * Here we process the removed elements
  */
  contentArrayWillChange(array, idx, removedCount) {
    for (var i = idx; i < idx + removedCount; i++) {
      this.objectWasRemoved(array.objectAt(i));
    }

    if (this._selectize) {
      this._selectize.refreshOptions(this._selectize.isFocused && !this._selectize.isInputHidden);
    }
  },

  /*
  * Triggered after the content array changes
  * Here we process the inserted elements
  */
  contentArrayDidChange(array, idx, removedCount, addedCount) {
    for (var i = idx; i < idx + addedCount; i++) {
      this.objectWasAdded(array.objectAt(i));
      this.addLabelObserver(array.objectAt(i));
    }

    if (this._selectize) {
      this._selectize.refreshOptions(this._selectize.isFocused && !this._selectize.isInputHidden);
    }

    this._selectionDidChange();
  },

  _groupedContentWillChange(groupedContent) {
    if (!this._selectize) { return; }
    if (isEmpty(groupedContent)) { return; }

    groupedContent.forEach(group => {
      group.get('content').removeArrayObserver(this, {
        willChange: '_groupedContentArrayWillChange',
        didChange: '_groupedContentArrayDidChange',
      });
    });
  },

  /**
  * Ember observer triggered when the groupedContent property is changed
  * We need to bind an array observer to become notified of each group's array changes,
  * then notify that the parent array has changed. This is because computed properties
  * have trouble with nested array changes.
  */
  _groupedContentDidChange: observer('groupedContent', function() {
    var groupedContent = this.get('groupedContent');
    if (this._oldGroupedContent !== groupedContent) {
      this._groupedContentWillChange(this._oldGroupedContent);
      this._oldGroupedContent = groupedContent;
    }

    if (!this._selectize) {
      return;
    }
    if (isEmpty(groupedContent)) { return; }

    //var willChangeWrapper = run.bind(this, function() { this.groupedContentArrayWillChange.apply(this, arguments); });
    //var didChangeWrapper = run.bind(this, function() { this.groupedContentArrayDidChange.apply(this, arguments); });

    groupedContent.forEach(group => {
      group.get('content').addArrayObserver(this, {
        willChange: '_groupedContentArrayWillChange',
        didChange: '_groupedContentArrayDidChange',
      });
    });
    var len = groupedContent ? get(groupedContent, 'length') : 0;
    this._groupedContentArrayDidChange(groupedContent, 0, null, len);
  }),

  /*
  * Triggered before the grouped content array changes
  * Here we process the removed elements
  */
  _groupedContentArrayWillChange: Ember.K,

  /*
  * Triggered after the grouped content array changes
  * Here we process the inserted elements
  */
  _groupedContentArrayDidChange() {
    this.notifyPropertyChange('groupedContent.[]');
  },

  /*
  * Function that is responsible for Selectize's option inserting logic
  * If the option is an object or Ember instance, we set an observer on the label value of it.
  * This way, we can later update the label of it.
  * Useful for dealing with objects that 'lazy load' some properties/relationships.
  */
  objectWasAdded(obj) {
    var data = {};
    var sortField = this.get('sortField');

    if (typeOf(obj) === 'object' || typeOf(obj) === 'instance') {
      data = {
        label: this.getLabelFor(obj),
        value: this.getValueFor(obj),
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

      if (get(obj, this.get('_groupPath'))) {
        data.optgroup = get(obj, this.get('_groupPath'));
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

  addLabelObserver(obj) {
    //Only attach observer if the label is a property of an object
    if (typeOf(obj) === 'object' || typeOf(obj) === 'instance') {
      Ember.addObserver(obj, this.get('_labelPath'), this, '_labelDidChange');
    }
  },

  /*
  * Function that is responsible for Selectize's option removing logic
  */
  objectWasRemoved(obj) {
    if (typeOf(obj) === 'object' || typeOf(obj) === 'instance') {
      Ember.removeObserver(obj, this.get('_labelPath'), this, '_labelDidChange');
    }
    if (this._selectize) {
      this._selectize.removeOption(this.getValueFor(obj));
    }
  },

  /*
  * Ember Observer that triggers when an option's label changes.
  * Here we need to update its corresponding option with the new data
  */
  _labelDidChange(sender) {
    if (!this._selectize) { return; }
    var data = {
      label: this.getLabelFor(sender),
      value: this.getValueFor(sender),
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
  _disabledDidChange: observer('disabled', function() {
    if (!this._selectize) { return; }
    var disable = this.get('disabled');
    if (disable) {
      this._selectize.disable();
    } else {
      this._selectize.enable();
    }
  }),

  /*
  * Observer on the placeholder property that updates selectize's placeholder.
  */
  _placeholderDidChange: observer('placeholder', function() {
    if (!this._selectize) { return; }
    var placeholder = this.get('placeholder');
    this._selectize.settings.placeholder = placeholder;
    this._selectize.updatePlaceholder();
  }),

  /*
  * Observer on the loading property.
  * Here we add/remove a css class, similarly to how selectize does.
  */
  _loadingDidChange: observer('loading', function() {
    var loading = this.get('loading');
    var loadingClass = this.get('loadingClass');
    if (loading) {
      this._selectize.$wrapper.addClass(loadingClass);
    } else {
      this._selectize.$wrapper.removeClass(loadingClass);
    }
  }),

  _lookupComponent(name) {
    let owner = getOwner(this);
    let componentLookupKey = `component:${name}`;
    let layoutLookupKey = `template:components/${name}`;
    let layout = owner._lookupFactory(layoutLookupKey);
    let component = owner._lookupFactory(componentLookupKey);

    if (layout && !component) {
      owner.register(componentLookupKey, Component);
      component = owner._lookupFactory(componentLookupKey);
    }

    return { component, layout };
  },

  _componentToDOM(componentName, data) {
    let { component, layout } = this._lookupComponent(componentName);

    assert(`ember-selectize could not find a component named "${componentName}" in your Ember application.`, component);

    let attrs = { data };

    if (layout) {
      attrs.layout = layout;
    }

    let componentInstance = component.create(attrs);

    let container = document.createElement('div');
    componentInstance.appendTo(container);

    return container;
  },

  _mergeSortField(options) {
    var sortField = this.get('sortField');
    if (sortField) {
      var sortArray = this._getSortArray(sortField);
      assign(options, { sortField: sortArray });
    }
    return options;
  },

  _getSortArray(sortField) {
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
