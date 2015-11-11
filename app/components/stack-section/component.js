import Ember from 'ember';
import C from 'ui/utils/constants';
import { parseExternalId } from 'ui/utils/parse-externalid';

export default Ember.Component.extend({
  prefs: Ember.inject.service(),

  model: null,
  collapsed: true,

  classNames: ['stack-section'],

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
    }
  },

  didInitAttrs() {
    var list = this.get('prefs.'+C.PREFS.EXPANDED_STACKS)||[];
    if ( list.indexOf(this.get('model.id')) >= 0 )
    {
      this.set('collapsed', false);
    }
  },

  isKubernetes: function() {
    var parts = parseExternalId(this.get('model.externalId'));
    return parts && parts.kind === C.EXTERNALID.KIND_KUBERNETES;
  }.property('model.externalId'),


  instanceCount: function() {
    var count = 0;
    (this.get('model.services')||[]).forEach((service) => {
      count += service.get('instances.length')||0;
    });

    return count;
  }.property('model.services.@each.healthState'),
});
