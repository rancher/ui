import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { set } from '@ember/object';

export default Component.extend(NewOrEdit, {
  intl:   service(),
  router: service(),

  model:    null,
  readOnly: false,

  actions: {
    cancel() {
      this.goBack();
    },

    setLabels(labels) {
      let out = {};

      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      set(this, 'model.labels', out);
    },
  },

  goBack() {
    this.get('router').transitionTo('global-admin.security.policies.index');
  },

  doneSaving() {
    this.goBack();
  },
});
