import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { all as PromiseAll } from 'rsvp';
import Component from '@ember/component';
import NewOrEdit from 'ui/mixins/new-or-edit';
import layout from './template';
import { get, set, setProperties } from '@ember/object';

const M_CONFIG = {
  type: 'projectRoleTemplateBinding',
  subjectKind: '',
  subjectName: '',
  projectRoleTemplateId: '',
  projectId: '',
};

export default Component.extend(NewOrEdit, {
  layout,
  intl: service(),
  router: service(),
  globalStore: service(),
  model: null,
  memberConfig: M_CONFIG,
  primaryResource: alias('model.project'),
  secPolicy: alias('model.project.defaultPodSecurityPolicyTemplateId'),
  policies: alias('model.policies'),

  memberArray: null,
  toAdd: null,
  toUpdate: null,
  toRemove: null,

  actions: {
    cancel() {
      this.goBack();
    },

    expandFn() {
    },

    initAlert(boundFn) {
      this.set('alertChildDidSave', boundFn);
    },
  },

  alertChildDidSave: null,

  init() {
    this._super(...arguments);
    let bindings = (get(this,'model.project.projectRoleTemplateBindings')||[]).slice();
    bindings = bindings.filter(x =>get(x, 'name') !== 'creator');
    set(this, 'memberArray', bindings);
  },

  goBack() {
    get(this, 'router').transitionTo('authenticated.cluster.projects.index');
  },

  didSave() {
    const pr = get(this, 'primaryResource');
    return this.alertChildDidSave().then(() => {
      return pr;
    });
  },

  doneSaving() {
    this.goBack();
  },
});
