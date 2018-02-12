import Mixin from '@ember/object/mixin';
import ViewNewEdit from 'shared/mixins/view-new-edit';
import ChildHook from 'shared/mixins/child-hook';
import ManageLabels from 'shared/mixins/manage-labels';
import { get, set, computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { addAction } from 'ui/utils/add-view-action';

const MEMBER_CONFIG = {
  type: 'clusterRoleTemplateBinding',
};

export default Mixin.create(ViewNewEdit, ChildHook, ManageLabels, {
  configField: '<override me>',

  close: null, // action to finish adding
  hideProviders: null, // action to hide the provider choice

  globalStore: service(),
  router:     service(),

  cluster: alias('model.cluster'),
  primaryResource: alias('model.cluster'),
  labelResource: alias('model.cluster'),
  memberConfig: MEMBER_CONFIG,
  errors: null,

  init() {
    this._super(...arguments);
  },

  actions: {
    addLabel: addAction('addLabel', '.key'),

    setLabels(labels) {
      let out = {};
      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      set(this, 'labelResource.labels', out);
    }
  },

  config: computed('configField', function() {
    const field = 'cluster.' + get(this, 'configField');
    return get(this, field);
  }),

  willSave() {
    const cluster = get(this, 'cluster');
    const field = get(this, 'configField');
    cluster.clearProvidersExcept(field);
    return this._super(...arguments);
  },

  didSave() {
    const cluster = get(this, 'cluster');
    return cluster.waitForCondition('BackingNamespaceCreated').then(() => {
      return this.applyHooks().then(() => {
        return cluster;
      });
    });
  },

  doneSaving() {
    this.get('router').transitionTo('global-admin.clusters.index');
  },
});
