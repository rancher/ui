import Resource from 'ember-api-store/models/resource';
import { denormalizeId, denormalizeIdArray } from 'ember-api-store/utils/denormalize';

export default Resource.extend({
  type: 'lbConfig',

  defaultCertificate: denormalizeId('defaultCertificateId','certificate'),
  certificates: denormalizeIdArray('certificateIds'),

  needsCertificate: function() {
    return !!this.get('portRules').findBy('needsCertificate',true);
  }.property('portRules.@each.needsCertificate'),

  canSticky: function() {
    return !!this.get('portRules').findBy('canSticky',true);
  }.property('portRules.@each.canSticky'),
});
