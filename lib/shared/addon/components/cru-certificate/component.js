import Component from '@ember/component';
import { get, set, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import OptionallyNamespaced from 'shared/mixins/optionally-namespaced';
import layout from './template';

const BEGIN_CERTIFICATE = '-----BEGIN CERTIFICATE-----';
const BEGIN_RSA_PRIVATE_KEY = '-----BEGIN RSA PRIVATE KEY-----';

export default Component.extend(ViewNewEdit, OptionallyNamespaced, {
  layout,
  model: null,
  intl: service(),

  titleKey: 'newCertificate.title',
  scope: 'project',
  namespace: null,

  isEncrypted: computed('model.key', function () {
    var key = get(this, 'model.key') || '';
    return key.match(/^Proc-Type: 4,ENCRYPTED$/m) || key.match(/^-----BEGIN ENCRYPTED PRIVATE KEY-----$/m);
  }),

  projectType: 'certificate',
  namespacedType: 'namespacedCertificate',

  validate() {
    this._super();
    var errors = get(this, 'errors') || [];
    var intl = get(this, 'intl');

    if (get(this, 'isEncrypted')) {
      errors.push(intl.t('newCertificate.errors.encrypted'));
    }

    if (!get(this, 'model.key')) {
      errors.push(intl.t('newCertificate.errors.key.required'));
    } else {
      if (get(this, 'model.key').indexOf(BEGIN_RSA_PRIVATE_KEY) !== 0) {
        errors.push(intl.t('newCertificate.errors.key.invalidFormat'));
      }
    }

    if (!get(this, 'model.certs')) {
      errors.push(intl.t('newCertificate.errors.cert.required'));
    } else {
      if (get(this, 'model.certs').indexOf(BEGIN_CERTIFICATE) !== 0) {
        errors.push(intl.t('newCertificate.errors.cert.invalidFormat'));
      }
    }

    set(this, 'errors', errors);
    return get(this, 'errors.length') === 0;
  },
});
