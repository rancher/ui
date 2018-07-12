import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Component.extend(NewOrEdit, {
  intl:   service(),
  router: service(),

  model:    null,
  readOnly: false,

  actions: {
    cancel() {

      this.goBack();

    },
  },

  goBack() {

    this.get('router').transitionTo('global-admin.security.policies.index');

  },

  doneSaving() {

    this.goBack();

  },
});
