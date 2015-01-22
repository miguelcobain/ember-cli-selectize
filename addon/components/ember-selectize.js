import Ember from 'ember';

var get = Ember.get, set = Ember.set, isArray = Ember.isArray, typeOf = Ember.typeOf,
  getWithDefault = Ember.getWithDefault, camelize = Ember.String.camelize;

/**
 * Ember.Selectize is an Ember View that encapsulates a Selectize component.
 * The goal is to use this as a near dropin replacement for Ember.Select.
 */
export default Ember.Component.extend({
  attributeBindings : ['multiple','autocomplete','required'],
  classNames : ['ember-selectize'],

  autocomplete:'off',
  // Allows to use prompt (like in Ember.Select) or placeholder property
  placeholder: Ember.computed.alias('prompt'),
  tagName : 'select',

  /**
  * overrideable object paths for value and label paths
  */
  optionValuePath : null,
  optionLabelPath : null,

  /**
  * The array of the default plugins to load into selectize
  */
  plugins: ['remove_button'],

  /**
  * Computed properties that hold the processed paths ('content.' replacement),
  * as it is done on Ember.Select
  */
  _valuePath : Ember.computed('optionValuePath',function(){
    return getWithDefault(this,'optionValuePath','content.value').replace(/^content\.?/, '');
  }),
  _labelPath : Ember.computed('optionLabelPath',function(){
    return getWithDefault(this,'optionLabelPath','content.label').replace(/^content\.?/, '');
  }),

  /**
  * This flag should be true when the element is present in the DOM and false when if isn't.
  * This helps to avoid triggering unecessary observers.
  */
  inDOM: false,

  /**
  * Pass a string to 'create' property to enable tag creation mode.
  * When active, ember-selectize will send an action with that name to the application when a tag is created.
  */
  create:false,

  /**
  * Loading feature default values.
  * If you want to override the css class that is applied, change the `loadingClass` property.
  */
  loading:false,
  loadingClass:'loading',

  /**
  * The render function names selectize expects.
  * We will use these to automatically infer the properties with the template and view names.
  */
  functionNames:['option','item','option_create','optgroup_header','optgroup'],
  templateSuffix : 'Template',
  viewSuffix : 'View',
  renderOptions: Ember.computed(function(){
    var functionNames = get(this,'functionNames'),
    templateSuffix = get(this,'templateSuffix'),
    viewSuffix = get(this,'viewSuffix'),
    //this hash will contain the render functions
    renderFunctions = {};

    functionNames.forEach(function(item){
      // infer the view name by camelizing selectize's function and appending a view suffix (overridable)
      var viewPropertyName = camelize(item)+viewSuffix;
      var viewToRender = get(this,viewPropertyName);

      var self = this;
      if(viewToRender){
        // we have a view to render. set the function.
        renderFunctions[item] = function(data){
          return self._viewToString(viewToRender,data.data);
        };
      } else {
        // there isn't a view to render. try to get a template.
        // infer the template name by camelizing selectize's function and appending a template suffix (overridable)
        var templatePropertyName = camelize(item)+templateSuffix;
        var templateToRender = get(this,templatePropertyName);

        if(templateToRender){
          // we have a template to render. set the function.
          renderFunctions[item] = function(data){
            return self._templateToString(templateToRender,data.data);
          };
        }
      }
    },this);

    return renderFunctions;
  }),

  selectizeOptions: Ember.computed(function() {
    var allowCreate = get(this, 'create');

    //We proxy callbacks through jQuery's 'proxy' to have the callbacks context set to 'this'
    return {
      plugins: this.plugins,
      labelField : 'label',
      valueField : 'value',
      searchField : 'label',
      create: allowCreate ? Ember.$.proxy(this._create, this) : false,
      onItemAdd : Ember.$.proxy(this._onItemAdd, this),
      onItemRemove : Ember.$.proxy(this._onItemRemove, this),
      onType : Ember.$.proxy(this._onType, this),
      render: get(this, 'renderOptions'),
      placeholder: get(this,'placeholder')
    };
  }),

  didInsertElement : function() {
    //View is now in DOM
    this.inDOM = true;

    //Create Selectize's instance
    this.$().selectize(get(this, 'selectizeOptions'));

    //Save the created selectize instance
    this.selectize = this.$()[0].selectize;

    //Some changes to content, selection and disabled could have happened before the View was inserted into the DOM.
    //We trigger all the observers manually to account for those changes.
    this._disabledDidChange();
    this._contentDidChange();
    this._selectionDidChange();
    this._loadingDidChange();
  },
  willDestroyElement : function() {
    //Unbind observers
    this._contentWillChange();
    this._selectionWillChange();

    //Invoke Selectize's destroy
    this.selectize.destroy();

    //We are no longer in DOM
    this.inDOM = false;
  },
  /**
  * Event callback that is triggered when user creates a tag
  */
  _create:function(input,callback){
    // Delete user entered text
    this.selectize.setTextboxValue('');
    // Send create action
    this.sendAction('create',input);
    // We cancel the creation here, so it's up to you to include the created element
    // in the content and selection property
    callback(null);
  },
  /**
  * Event callback that is triggered when user types in the input element
  */
  _onType:function(str){
    set(this,'filter',str);
  },
  /**
  * Event callback triggered when an item is added (when something is selected)
  * Here we need to update our selection property (if single selection) or array (if multiple selection)
  */
  _onItemAdd : function(value) {
    var content = get(this,'content');
    var selection = get(this,'selection');
    var multiple = get(this,'multiple');
    if(content){
      var obj = content.find(function(item){
        if(get(item,get(this,'_valuePath')) === value){
          return true;
        }
      },this);
      if(multiple && isArray(selection) && obj){
        if(!selection.findBy(get(this,'_valuePath'),get(obj,get(this,'_valuePath')))){
          selection.addObject(obj);
        }
      } else if(obj){
        if(!selection || (get(obj,get(this,'_valuePath')) !== get(selection,get(this,'_valuePath')))){
          set(this,'selection',obj);
        }
      }
    }
  },
  /**
  * Event callback triggered when an item is removed (when something is deselected)
  * Here we need to update our selection property (if single selection, here set to null) or remove item from array (if multiple selection)
  */
  _onItemRemove : function(value) {
    if(this.removing){
      return;
    }
    var content = get(this,'content');
    var selection = get(this,'selection');
    var multiple = get(this,'multiple');
    if(content){
      var obj = content.find(function(item){
        if(get(item,get(this,'_valuePath')) === value){
          return true;
        }
      },this);
      if(multiple && isArray(selection) && obj){
        selection.removeObject(obj);
      } else if(!multiple){
        this.set('selection',null);
      }
    }
  },
  /**
  * Ember observer triggered before the selection property is changed
  * We need to unbind any array observers if we're in multiple selection
  */
  _selectionWillChange: Ember.beforeObserver(function() {
    var multiple = get(this, 'multiple');
    var selection = get(this, 'selection');
    if(selection && isArray(selection) && multiple) {
      selection.removeArrayObserver(this,  {
        willChange : 'selectionArrayWillChange',
        didChange : 'selectionArrayDidChange'
      });
      var len = selection ? get(selection, 'length') : 0;
      this.selectionArrayWillChange(selection, 0, len);
    }
  }, 'selection'),
  /**
  * Ember observer triggered when the selection property is changed
  * We need to bind an array observer when selection is multiple
  */
  _selectionDidChange : Ember.observer(function() {
    if(!this.inDOM){
      return;
    }
    var multiple = get(this, 'multiple');
    var selection = get(this, 'selection');
    if (multiple) {
      if(selection) {
        if(!isArray(selection)){
          selection = Ember.A([selection]);
          set(this,'selection',selection);
          return;
        }
        selection.addArrayObserver(this, {
          willChange : 'selectionArrayWillChange',
          didChange : 'selectionArrayDidChange'
        });
      } else {
        set(this,'selection',[]);
        return;
      }
      var len = selection ? get(selection, 'length') : 0;
      this.selectionArrayDidChange(selection, 0, null, len);
    } else {
      if(selection) {
        this.selectize.addItem(get(selection,get(this,'_valuePath')));
      } else {
        set(this,'selection',null);
        if(this.selectize){
          this.selectize.clear();
          this.selectize.showInput();
        }
      }
    }
  }, 'selection'),
  /*
  * Triggered before the selection array changes
  * Here we process the removed elements
  */
  selectionArrayWillChange : function(array, idx, removedCount) {
    this.removing = true;
    for (var i = idx; i < idx + removedCount; i++) {
      this.selectionObjectWasRemoved(array.objectAt(i));
    }
    this.removing = false;
  },
  /*
  * Triggered after the selection array changes
  * Here we process the inserted elements
  */
  selectionArrayDidChange : function(array, idx, removedCount, addedCount) {
    for (var i = idx; i < idx + addedCount; i++) {
      this.selectionObjectWasAdded(array.objectAt(i), i);
    }
  },
  /*
  * Function that is responsible for Selectize's item inserting logic
  */
  selectionObjectWasAdded : function(obj) {
    if(this.selectize){
      this.selectize.addItem(get(obj,get(this,'_valuePath')));
    }
  },
  /*
  * Function that is responsible for Selectize's item removing logic
  */
  selectionObjectWasRemoved : function(obj) {
    if(this.selectize){
      this.selectize.removeItem(get(obj,get(this,'_valuePath')));
    }
  },
  /**
  * Ember observer triggered before the content property is changed
  * We need to unbind any array observers
  */
  _contentWillChange: Ember.beforeObserver(function() {
    if(!this.inDOM){
      return;
    }
    var content = get(this, 'content');
    if(content) {
      content.removeArrayObserver(this, {
        willChange : 'contentArrayWillChange',
        didChange : 'contentArrayDidChange'
      });
    }
    //Trigger remove logic
    var len = content ? get(content, 'length') : 0;
    this.removing = true;
    this.contentArrayWillChange(content, 0, len);
    this.removing = false;
    this._selectionDidChange();
  }, 'content'),
  /**
  * Ember observer triggered when the content property is changed
  * We need to bind an array observer to become notified of its changes
  */
  _contentDidChange : Ember.observer(function() {
    if(!this.inDOM){
      return;
    }
    var content = get(this, 'content');
    if (content) {
      content.addArrayObserver(this, {
        willChange : 'contentArrayWillChange',
        didChange : 'contentArrayDidChange'
      });
    }
    var len = content ? get(content, 'length') : 0;
    this.contentArrayDidChange(content, 0, null, len);
  }, 'content'),
  /*
  * Triggered before the content array changes
  * Here we process the removed elements
  */
  contentArrayWillChange : function(array, idx, removedCount) {
    for (var i = idx; i < idx + removedCount; i++) {
      this.objectWasRemoved(array.objectAt(i));
    }

    if(this.selectize){
      this.selectize.refreshOptions(this.selectize.isFocused && !this.selectize.isInputHidden);
    }

    this._selectionDidChange();
  },
  /*
  * Triggered after the content array changes
  * Here we process the inserted elements
  */
  contentArrayDidChange : function(array, idx, removedCount, addedCount) {
    for (var i = idx; i < idx + addedCount; i++) {
      this.objectWasAdded(array.objectAt(i), i);
    }

    if(this.selectize){
      this.selectize.refreshOptions(this.selectize.isFocused && !this.selectize.isInputHidden);
    }

    this._selectionDidChange();
  },
  /*
  * Function that is responsible for Selectize's option inserting logic
  * If the option is an object or Ember instance, we set an observer on the label value of it.
  * This way, we can later update the label of it.
  * Useful for dealing with objects that 'lazy load' some properties/relationships.
  */
  objectWasAdded : function(obj) {
    var data = {};
    if(typeOf(obj) === 'object' || typeOf(obj) === 'instance'){
      data = {
        label : get(obj, get(this,'_labelPath')),
        value : get(obj, get(this,'_valuePath')),
        data : obj
      };
      Ember.addObserver(obj,get(this,'_labelPath'),this,'_labelDidChange');
    } else {
      data = {
        label : obj,
        value : obj,
        data : obj
      };
    }

    if(this.selectize){
      this.selectize.addOption(data);
    }
  },
  /*
  * Function that is responsible for Selectize's option removing logic
  */
  objectWasRemoved : function(obj) {
    if(typeOf(obj) === 'object' || typeOf(obj) === 'instance'){
      Ember.removeObserver(obj,get(this,'_labelPath'),this,'_labelDidChange');
    }
    if(this.selectize){
      this.selectize.removeOption(get(obj, get(this,'_valuePath')));
    }
  },
  /*
  * Ember Observer that triggers when an option's label changes.
  * Here we need to update its corresponding option with the new data
  */
  _labelDidChange: function(sender) {
    if(!this.selectize){
      return;
    }
    var data = {
      label : get(sender, get(this,'_labelPath')),
      value : get(sender, get(this,'_valuePath')),
      data : sender
    };
    this.selectize.updateOption(data.value,data);
  },
  /*
  * Observer on the disabled property that enables or disables selectize.
  */
  _disabledDidChange: Ember.observer(function(){
    if(!this.selectize){
      return;
    }
    var disable = get(this,'disabled');
    if(disable){
      this.selectize.disable();
    } else {
      this.selectize.enable();
    }
  },'disabled'),
  /*
  * Observer on the placeholder property that updates selectize's placeholder.
  */
  _placeholderDidChange: Ember.observer(function(){
    if(!this.selectize){
      return;
    }
    var placeholder = get(this,'placeholder');
    this.selectize.settings.placeholder = placeholder;
    this.selectize.updatePlaceholder();
  },'placeholder'),
  /*
  * Observer on the loading property.
  * Here we add/remove a css class, similarly to how selectize does.
  */
  _loadingDidChange:Ember.observer(function(){
    var loading = get(this,'loading'),
    loadingClass = get(this,'loadingClass');
    if(loading){
      this.selectize.$wrapper.addClass(loadingClass);
    } else {
      this.selectize.$wrapper.removeClass(loadingClass);
    }
  },'loading'),

  _templateToString:function(template,data) {
    //create a view with a template
    var view = this.createChildView(Ember.View, {
      templateName: template,
      context:data
    });
    return this._getStringFromView(view);
  },
  _viewToString:function(viewName,data) {
    //create a view with the given name
    var view = this.createChildView(viewName, {
      context:data
    });
    return this._getStringFromView(view);
  },
  /*
  * Encapsulates the logic of converting a view to a string
  */
  //FIX ME: this method does not work in Ember 1.8.0
  //see http://git.io/VUYZ4g for more info
  _getStringFromView:function(view){
    var buffer = new Ember.RenderBuffer();
    view.renderToBuffer(buffer);
    return buffer.string();
  }
});
