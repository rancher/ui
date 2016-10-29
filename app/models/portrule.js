import Resource from 'ember-api-store/models/resource';
import { denormalizeServiceId } from 'ui/utils/denormalize-snowflakes';

export default Resource.extend({
  type: 'portRule',

  service: denormalizeServiceId(),

  canHostname: function() {
    return ['http','https','sni'].includes(this.get('protocol').toLowerCase());
  }.property('protocol'),

  canPath: function() {
    return ['http','https'].includes(this.get('protocol').toLowerCase());
  }.property('protocol'),

  checkHttps: function() {
    Ember.run.later(this,'setHttpsTarget', 500);
  }.observes('protocol','sourcePort'),

  setHttpsTarget: function() {
    if ( this.get('targetPort') ) {
      return;
    }

    let proto = this.get('protocol').toLowerCase();
    let src = parseInt(this.get('sourcePort'),10);
    let tgt = null;

    if ( (proto === 'http' && src === 80) || ( proto === 'https' && src === 443) ) {
      tgt = 80;
    } else if ( proto === 'sni' && src === 443 ) {
      tgt = 443;
    }

    if ( tgt ) {
      this.set('targetPort', tgt);
    }
  },
});
