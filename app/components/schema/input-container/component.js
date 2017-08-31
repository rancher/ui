import Ember from 'ember';

export default Ember.Component.extend({
  allContainers : Ember.inject.service(),

  selected:          null,  // Selected service ID
  exclude:           null,  // ID or array of IDs to exclude from list
  stack:             null,  // The current stack, to generate stack-relative names

  // For use as a catalog question
  field: null,              // Read default from a schema resourceField
  value: null,              // stackName/serviceName string output

  init() {
    this._super(...arguments);

    let def = this.get('field.default');
    if ( def && !this.get('selected') ) {

      let match = this.get('allContainers.list').findBy('name', def);
      this.set('selected', match || null);
    }
  },

  grouped: function() {
    let list = this.get('allContainers.list');

    let exclude = this.get('exclude');
    if ( exclude ) {
      if ( !Ember.isArray(exclude) ) {
        exclude = [exclude];
      }

      list = list.filter(x => !exclude.includes(x.id));
    }

    return this.get('allContainers').group(list);
  }.property('allContainers.list.[]','canBalanceTo','canHaveContainers'),

  selectedChanged: function() {
    let id = this.get('selected');
    let str = null;

    if ( id ) {
      let container = this.get('allContainers').byId(id);
      if ( container ) {
        if ( this.get('stack') && this.get('stack') === container.get('stack') ) {
          str = container.get('name');
        } else {
          str = container.get('stack.name') + '/' + container.get('name');
        }
      }
    }

    this.set('value', str);
  }.observes('selected'),
});
