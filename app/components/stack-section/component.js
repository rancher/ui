import Ember from 'ember';
import C from 'ui/utils/constants';
import { parseExternalId } from 'ui/utils/parse-externalid';

export default Ember.Component.extend({
  prefs             : Ember.inject.service(),
  projects          : Ember.inject.service(),
  hasVm             : Ember.computed.alias('projects.current.virtualMachine'),

  model             : null,
  single            : false,

  collapsed         : true,
  classNames        : ['stack-section'],

  actions: {
    toggleCollapse() {
      var collapsed = this.toggleProperty('collapsed');
      var list = this.get('prefs.'+C.PREFS.EXPANDED_STACKS)||[];
      if ( collapsed )
      {
        list.removeObject(this.get('model.id'));
      }
      else
      {
        list.addObject(this.get('model.id'));
      }

      this.get('prefs').set(C.PREFS.EXPANDED_STACKS, list);
    },

    addtlInfo: function(service) {
      this.sendAction('showAddtlInfo', service);
    },
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
