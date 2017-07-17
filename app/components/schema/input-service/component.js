import Ember from 'ember';

export default Ember.Component.extend({
  allServices : Ember.inject.service(),

  selected:          null,  // Selected service ID
  selectClass:       'form-control',
  canBalanceTo:      false, // require service have canBalanceTo=true
  canHaveContainers: false, // require service have hasContainers=true
  canBeSystem:       true, // allow service to have system=true
  exclude:           null,  // ID or array of IDs to exclude from list

  // For use as a catalog question
  field: null,              // Read default from a schema resourceField
  value: null,              // stackName/serviceName string output

  init() {
    this._super(...arguments);

    let def = this.get('field.default');
    if ( def && !this.get('selected') ) {
      var exact, justService;

      this.get('allServices.list').forEach((service) => {
        if ( def === service.value )
        {
          exact = service.id;
        }
        else if ( def === service.name )
        {
          justService = service.id;
        }
      });

      this.set('selected', exact || justService || null);
    }
  },

  grouped: function() {
    let list = this.get('allServices.list').filter((item) => {
      return (!this.get('canBalanceTo') || item.obj.get('canBalanceTo')) &&
             (!this.get('canHaveContainers') || item.obj.get('canHaveContainers')) &&
             ( this.get('canBeSystem') || !item.obj.get('system'));
    });

    let exclude = this.get('exclude');
    if ( exclude ) {
      if ( !Ember.isArray(exclude) ) {
        exclude = [exclude];
      }

      list = list.filter(x => !exclude.includes(x.id));
    }

    let out = this.get('allServices').group(list);
    let selected = this.get('allServices').byId(this.get('selected'));
    if ( selected && !list.includes(selected) ) {
      out['(Selected)'] = [{
        id: selected.get('id'),
        name: selected.get('displayName'),
        kind: selected.get('type'),
        obj: selected,
      }];
    }

    return out;
  }.property('allServices.list.[]','canBalanceTo','canHaveContainers'),

  selectedChanged: function() {
    let id = this.get('selected');
    let str = null;

    if ( id ) {
      let service = this.get('allServices').byId(id);
      if ( service ) {
        str = service.get('stack.name') + '/' + service.get('name');
      }
    }

    this.set('value', str);
  }.observes('selected'),
});
