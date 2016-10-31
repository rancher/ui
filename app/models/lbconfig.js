import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  type: 'lbConfig',

  needsCertificate: function() {
    return !!this.get('portRules').findBy('needsCertificate',true);
  }.property('portRules.@each.needsCertificate'),

  canSticky: function() {
    return !!this.get('portRules').findBy('canSticky',true);
  }.property('portRules.@each.canSticky'),
});
