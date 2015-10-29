import Ember from 'ember';

var Issue = Ember.Object.extend({
    subject: '',
    init: function() {
        this.collection = Ember.A([]);
    },
    change_collection: function(the_status_id) {
        let issue_id = this.get('id');
        if(the_status_id) {
            let collection = this.get('collection') || [];
            this.set('collection', collection.concat(issue_id));
        }
    }
});

export default Issue;
