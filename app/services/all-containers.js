import Ember from 'ember';

export default Ember.Service.extend({
  intl: Ember.inject.service(),
  store: Ember.inject.service(),
  prefs: Ember.inject.service(),

  list: function() {
    let intl = this.get('intl');
    let showSystem = this.get('prefs.showSystemResources');

    return this.get('_allInstances').filter((inst) => !inst.get('serviceId') && (!inst.get('isSystem') || showSystem)).map((inst) => {
      let stackName = 'Standalone';
      if ( inst.get('stack') ) {
        stackName = inst.get('stack.displayName') || '('+inst.get('stackId')+')';
      }

      return {
        group: intl.t('allServices.stackGroup', {name: stackName}),
        id: inst.get('id'),
        stackName: stackName,
        name: inst.get('displayName'),
        obj: inst,
      };
    });
  }.property('_allInstances.@each.{id,system,displayName}','prefs.showSystemResources'),

  grouped: function() {
    return this.group(this.get('list'));
  }.property('list.[]'),

  group(list) {
    let out = {};

    list.slice().sortBy('group','name','id').forEach((inst) => {
      let ary = out[inst.group];
      if( !ary ) {
        ary = [];
        out[inst.group] = ary;
      }

      ary.push(inst);
    });

    return out;
  },

  _allInstances: function() {
    let store = this.get('store');
    store.find('instance');
    return store.all('instance');
  }.property(),

  byId(id) {
    return this.get('store').getById('instance', id);
  },
});
