import Ember from 'ember';
import C from 'ui/utils/constants';
import { parseExternalId } from 'ui/utils/parse-externalid';

export default Ember.Component.extend({
  prefs             : Ember.inject.service(),
  projects          : Ember.inject.service(),
  hasVm             : Ember.computed.alias('projects.current.virtualMachine'),

  model             : null,
  single            : false,
  showAddService    : true,

  collapsed         : true,
  classNames        : ['stack-section'],

  sortedServices    : Ember.computed.sort('model.services','sortBy'),
  sortBy: ['name','id'],

  actions: {
    toggleCollapse() {
      var collapsed = this.toggleProperty('collapsed');
      var list = this.get('prefs.'+C.PREFS.EXPANDED_STACKS)||[];
      let id = this.get('model.id');
      if ( collapsed )
      {
        list.removeObject(id);
      }
      else if (!list.includes(id))
      {
        // Add at the front
        list.unshift(id);
      }

      // Cut off the back to keep the list reasonable
      if ( list.length > 100 ) {
        list.length = 100;
      }

      this.get('prefs').set(C.PREFS.EXPANDED_STACKS, list);
    },

    addtlInfo(service) {
      this.sendAction('showAddtlInfo', service);
    },

    upgradeImage(service) {
      service.send('upgrade','true');
    }
  },

  init() {
    this._super(...arguments);

    var list = this.get('prefs.'+C.PREFS.EXPANDED_STACKS)||[];
    if ( list.indexOf(this.get('model.id')) >= 0 )
    {
      this.set('collapsed', false);
    }
  },

  isKubernetes: function() {
    var parts = parseExternalId(this.get('model.externalId'));
    return parts && parts.kind === C.EXTERNAL_ID.KIND_KUBERNETES;
  }.property('model.externalId'),


  instanceCount: function() {
    var count = 0;
    (this.get('model.services')||[]).forEach((service) => {
      count += service.get('instanceCount')||0;
    });

    return count;
  }.property('model.services.@each.instanceCount'),

  outputs: function() {
    var out = [];
    var map = this.get('model.outputs')||{};
    Object.keys(map).forEach((key) => {
      out.push(Ember.Object.create({
        key: key,
        value: map[key],
      }));
    });

    return out;
  }.property('model.outputs','model.id'),
});
