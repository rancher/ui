import Component from '@ember/component';
import {
  get, set, computed
} from '@ember/object';
import { inject as service } from '@ember/service';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import OptionallyNamespaced from 'shared/mixins/optionally-namespaced';
import layout from './template';

const BEGIN_CERTIFICATE = [
  '-----BEGIN CERTIFICATE-----'
];

const BEGIN_KEY = [
  '-----BEGIN EC PRIVATE KEY-----',
  '-----BEGIN RSA PRIVATE KEY-----',
]

export default Component.extend(ViewNewEdit, OptionallyNamespaced, {
  intl: service(),

  layout,
  model:     null,
  titleKey:  'newCertificate.title',
  scope:     'project',
  namespace: null,

  projectType:    'certificate',
  namespacedType: 'namespacedCertificate',

  isEncrypted: computed('model.key', function() {

    var key = get(this, 'model.key') || '';

    return key.match(/^Proc-Type: 4,ENCRYPTED$/m) || key.match(/^-----BEGIN ENCRYPTED PRIVATE KEY-----$/m);

  }),

  validate() {

    this._super();

    var errors = get(this, 'errors') || [];

    if ( get(this, 'scope') !== 'project' ) {

      errors.pushObjects(get(this, 'namespaceErrors') || []);

    }

    var intl = get(this, 'intl');

    if (get(this, 'isEncrypted')) {

      errors.push(intl.t('newCertificate.errors.encrypted'));

    }

    const key = get(this, 'model.key');

    if ( key ) {

      let ok = false;

      BEGIN_KEY.forEach((prefix) => {

        if ( key.trim().startsWith(prefix) ) {

          ok = true;

        }

      });

      if ( !ok ) {

        errors.push(intl.t('newCertificate.errors.key.invalidFormat'));

      }

    } else {

      errors.push(intl.t('newCertificate.errors.key.required'));

    }

    const certs = get(this, 'model.certs');

    if ( certs ) {

      let ok = false;

      BEGIN_CERTIFICATE.forEach((prefix) => {

        if ( certs.trim().startsWith(prefix) ) {

          ok = true;

        }

      });

      if ( !ok ) {

        errors.push(intl.t('newCertificate.errors.cert.invalidFormat'));

      }

    } else {

      errors.push(intl.t('newCertificate.errors.cert.required'));

    }

    set(this, 'errors', errors);

    return get(this, 'errors.length') === 0;

  },
});
