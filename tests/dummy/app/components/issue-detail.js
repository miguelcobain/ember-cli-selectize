import Ember from 'ember';

export default Ember.Component.extend({
    actions: {
        selected: function(status) {
            let issue = this.get('model');
            issue.change_collection(status.get('id'));
        }
    }
});
