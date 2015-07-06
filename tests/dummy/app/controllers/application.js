/* global alert */
import Ember from 'ember';

export default Ember.Controller.extend({
  names: Ember.A(['Tom', 'Yehuda', 'Mike']),
  items: Ember.A([
    Ember.Object.create({
      id: 1,
      label: 'Item 1'
    }),
    Ember.Object.create({
      id: 2,
      label: 'Item 2'
    }),
    Ember.Object.create({
      id: 3,
      label: 'Item 3'
    }),
    Ember.Object.create({
      id: 4,
      label: 'Item 4'
    })
  ]),

  getOption: function(item, escape) {
    return '<div class="hello"><i>' + escape(item.value) + '</i>) ' + escape(item.label) +'</div>';
  },

  taggedContent: Ember.A(),
  taggedValues: Ember.A(),
  itemValue: 3,
  taggedValuesString: Ember.computed('taggedValues.[]', function () {
    return this.get('taggedValues').join(', ');
  }),

  actions:{
    createAction:function(str){
      alert(str);
    },
    selectItem:function(v){
      this.set('itemValue', v);
    },

    createTag: function (input) {
      this.get('taggedContent').addObject(input);
      this.get('taggedValues').addObject(input);
    }
  }
});
