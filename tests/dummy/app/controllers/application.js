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

  groupedContent: Ember.A([
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
  ]),
  posts: Ember.A([
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
  ]),
  lastPostId: 3,
  lastPostGroupedId: 3,

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
    },

    addPost: function() {
      this.incrementProperty('lastPostId');
      this.get('posts').addObject({
        id: this.get('lastPostId'),
        category: 'Another 2',
        title: '#' + this.get('lastPostId') + ' This title will appear on select'
      });
    },

    addPostGrouped: function() {
      this.incrementProperty('lastPostGroupedId');
      this.get('groupedContent').findBy('label', 'Another').get('content').addObject({
        id: this.get('lastPostGroupedId'),
        title: '#' + this.get('lastPostGroupedId') + ' This title will appear on select'
      });
    }
  }
});
