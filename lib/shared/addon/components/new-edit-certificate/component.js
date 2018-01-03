import Component from '@ember/component';
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

  projectType: 'certificate',
  namespacedType: 'namespacedCertificate',
  doSave() {
    let self = this;
    let sup = self._super;
    return this.namespacePromise().then(() => {
      return sup.apply(self,arguments);
    });
  },

  doneSaving() {
    this.sendAction('cancel');
  },
});
