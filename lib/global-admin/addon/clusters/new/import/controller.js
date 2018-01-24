import Controller from '@ember/controller'
import NewOrEdit from 'ui/mixins/new-or-edit';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { get, set } from '@ember/object';

export default Controller.extend(NewOrEdit,{
  intl: service(),
  router: service(),

  model: null,

  primaryResource: alias('model.cluster'),

  actions: {
    cancel() {
      this.get('router').transitionTo('global-admin.clusters.index');
    },
  },

  validate() {
    const intl = get(this, 'intl');

    this._super(...arguments);
    let errors = get(this,'errors')||[];

    const config = get(this,'primaryResource.importedConfig.kubeConfig');
    if ( !config || !config.length ) {
      errors.push(intl.t('validation.required', {key: intl.t('k8sImport.kubeConfig.label')}));
    }

    set(this, 'errors', errors);
    return errors.length === 0;
  },

  doneSaving() {
    this.get('router').transitionTo('global-admin.clusters.index');
  },
});
