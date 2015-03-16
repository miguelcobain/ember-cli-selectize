/* global alert */
import Ember from 'ember';

export default Ember.Controller.extend({
  items:[
    Ember.Object.create({
      id:1,
      label:'Item 1'
    }),
    Ember.Object.create({
      id:2,
      label:'Item 2'
    }),
    Ember.Object.create({
      id:3,
      label:'Item 3'
    }),
    Ember.Object.create({
      id:4,
      label:'Item 4'
    })
  ],
  names:['Tom','Yehuda','Mike'],
  itemValue:3,
  getOption: function(item, escape) {
    return '<div class="hello"><i>' + escape(item.value) + '</i>) ' + escape(item.label) +'</div>';
  },
  actions:{
    createAction:function(str) {
      alert(str);
    },
    selectItem:function(v) {
      this.set('itemValue',v);
    },
    itemSelected: function(selection, value) {
      console.log("Item selected `" + Ember.inspect(selection) + "` (" + value + ")");
    },
    nameSelected: function(selection, value) {
      console.log("Name selected `" + Ember.inspect(selection) + "` (" + value + ")");
    }
  }
});
