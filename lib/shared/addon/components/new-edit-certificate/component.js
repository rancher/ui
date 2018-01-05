import Component from '@ember/component';
import { computed } from '@ember/object';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import OptionallyNamespaced from 'shared/mixins/optionally-namespaced';
import layout from './template';

export default Component.extend(ViewNewEdit, OptionallyNamespaced, {
  layout,
  model: null,

  titleKey: 'newCertificate.title',
  scope: 'project',
  namespace: null,

  actions: {
    cancel() {
      this.sendAction('cancel');
    },
  },

  isEncrypted: computed('model.key', function() {
    var key = this.get('model.key')||'';
    return key.match(/^Proc-Type: 4,ENCRYPTED$/m) || key.match(/^-----BEGIN ENCRYPTED PRIVATE KEY-----$/m);
  }),

  projectType: 'certificate',
  namespacedType: 'namespacedCertificate',

  validate() {
    this._super();
    var errors = this.get('errors', errors)||[];

    if ( this.get('isEncrypted') )
    {
      errors.push('The private key cannot be password-protected.');
    }

    this.set('errors', errors);
    return this.get('errors.length') === 0;
  },
});
