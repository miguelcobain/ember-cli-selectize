import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import { moduleForComponent, test } from 'ember-qunit';
import Issue from 'dummy/models/issue';
import Status from 'dummy/models/status';

let issue, one, two, statuses;

moduleForComponent('issue-detail', 'integration: issue-detail test', {
    integration: true,
    setup() {
        issue = Issue.create({id: 1, subject: 'Broken'});
        one = Status.create({id: 8, name: 'Open', issues: []});
        two = Status.create({id: 9, name: 'Closed', issues: [1]});
        statuses = Ember.A([one, two]);
    }
});

test('select-item will not modify the selection when updateSelection is false', function(assert) {
    this.set('model', issue);
    this.set('statuses', statuses);
    this.render(hbs`{{issue-detail model=model statuses=statuses}}`);
    let selector = 'select.x-status-select:eq(0) + .selectize-control';
    let $component = this.$(selector);
    assert.equal($component.find('div.item').length, 0);
    assert.equal($component.find('div.option').length, 2);
    this.$(`${selector} > .selectize-input`).trigger('click');
    Ember.run(() => {
        this.$(`${selector} > .selectize-dropdown div.option:eq(0)`).trigger('click').trigger('change');
    });
    assert.equal(issue.get('collection.length'), 1);
    assert.equal(issue.get('collection')[0], 1);
});

test('add-item will not modify the selection when updateSelection is false', function(assert) {
    this.set('model', issue);
    this.set('statuses', statuses);
    this.render(hbs`{{issue-detail-multi model=model statuses=statuses}}`);
    let selector = 'select.x-status-select:eq(0) + .selectize-control';
    let $component = this.$(selector);
    assert.equal($component.find('div.item').length, 0);
    assert.equal($component.find('div.option').length, 2);
    this.$(`${selector} > .selectize-input`).trigger('click');
    Ember.run(() => {
        this.$(`${selector} > .selectize-dropdown div.option:eq(0)`).trigger('click').trigger('change');
    });
    assert.equal(issue.get('collection.length'), 0);
});

test('remove-item will not modify the selection when updateSelection is false', function(assert) {
    issue.set('collection', Ember.A([one]));
    this.set('model', issue);
    this.set('statuses', statuses);
    this.render(hbs`{{issue-detail-multi model=model statuses=statuses}}`);
    let selector = 'select.x-status-select:eq(0) + .selectize-control';
    let $component = this.$(selector);
    assert.equal($component.find('div.item').length, 1);
    assert.equal($component.find('div.option').length, 1);
    Ember.run(() => {
        $component.find('div.item .remove').trigger('click').trigger('change');
    });
    assert.equal(issue.get('collection.length'), 1);
});
