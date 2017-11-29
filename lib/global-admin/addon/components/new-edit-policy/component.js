import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Component.extend(NewOrEdit, {
  intl: service(),
  router: service(),
  model: null,

  primaryResource: alias('model.policy'),

  actions: {
    cancel() {
      this.goBack();
    },
  },

  goBack: function() {
    this.get('router').transitionTo('global-admin.policies.index');
  },

  doesNameExist() {
    const policy = this.get('primaryResource');
    const currentPolicies = this.get('model.policies');

    if (currentPolicies.findBy('name', policy.get('name'))) {
      return true;
    }

    return false;
  },

  validate: function () {
    var errors = this.get('errors', errors) || [];

    if ((this.get('model.policy.name') || '').trim().length === 0) {
      errors.push(this.get('intl').findTranslationByKey('podSecurityPoliciesPage.new.errors.nameReq'));
    }

    if (!this.get('editing') && this.doesNameExist()) {
      errors.push(this.get('intl').findTranslationByKey('podSecurityPoliciesPage.new.errors.nameInExists'));
    }

    if (errors.length) {
      this.set('errors', errors.uniq());
      return false;
    }
    else {
      this.set('errors', null);
    }

    return true;
  },

  willSave() {
    let ok = this._super(...arguments);
    if (ok) {
      const policy = this.get('primaryResource');
      const name = (policy.get('name') || '').trim().toLowerCase();
      policy.set('name', name);
    }
    return ok;
  },

  doneSaving() {
    this.goBack();
  },
});
