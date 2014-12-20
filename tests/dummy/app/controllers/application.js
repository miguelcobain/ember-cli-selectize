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
  actions:{
    createAction:function(str){
      alert(str);
    }
  }
});
