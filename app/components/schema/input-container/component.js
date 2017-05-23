import Ember from 'ember';

export default Ember.Component.extend({
  allContainers : Ember.inject.service(),

  selected:          null,  // Selected service ID
  exclude:           null,  // ID or array of IDs to exclude from list

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
      let service = this.get('allContainers').byId(id);
      if ( service ) {
        str = service.get('stack.name') + '/' + service.get('name');
      }
    }

    this.set('value', str);
  }.observes('selected'),
});
