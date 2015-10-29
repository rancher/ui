import Ember from 'ember';
import C from 'ui/utils/constants';
import { parseExternalId } from 'ui/utils/parse-externalid';

export default Ember.Component.extend({
  model: null,
  collapseId: null,

  classNames: ['pod','project'],
  classNameBindings: ['stateBorder','isKubernetes:kubernetes'],

  isKubernetes: function() {
    var parts = parseExternalId(this.get('model.externalId'));
    return parts && parts.kind === C.EXTERNALID.KIND_KUBERNETES;
  }.property('model.externalId'),


  stateBorder: function() {
    return this.get('model.stateColor').replace("text-","border-top-");
  }.property('model.stateColor'),

  instanceCount: function() {
    var count = 0;
    (this.get('model.services')||[]).forEach((service) => {
      count += service.get('instances.length')||0;
    });

    return count;
  }.property('model.services.@each.healthState'),
});
