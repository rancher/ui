import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { reject, all as PromiseAll } from 'rsvp';
import Component from '@ember/component';
import NewOrEdit from 'ui/mixins/new-or-edit';
import layout from './template';
import { get, set } from '@ember/object';

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
  memberArray: alias('model.project.projectRoleTemplateBindings'),
  secPolicy: alias('model.project.defaultPodSecurityPolicyTemplateId'),
  policies: alias('model.policies'),

  actions: {
    cancel() {
      this.goBack();
    },
    expandFn() {

    }
  },

  goBack() {
    get(this, 'router').transitionTo('authenticated.cluster.projects.index');
  },

  validate() {
    var errors = get(this, 'errors') || [];

    if ( (get(this, 'model.project.name') || '').trim().length === 0 ) {
      errors.push(get(this, 'intl').findTranslationByKey('projectsPage.new.errors.nameReq'));
    }

    if ( errors.length ) {
      set(this, 'errors', errors.uniq());
      return false;
    } else {
      set(this, 'errors', null);
    }

    return true;
  },

  doSave() {
    if (get(this, 'editing')) {
      return this.setMembers(get(this, 'primaryResource'));
    } else {
      return this._super.apply(this, arguments).then((project) => {
        return this.setMembers(project);
      });
    }
  },

  doneSaving() {
    this.goBack();
  },

  setMembers(project) {
    const projectId = project.id;
    const members = get(this, 'memberArray');
    const promises = [];
    return get(this, 'globalStore').find('projectRoleTemplateBinding', null, { forceReload: true, filter: { projectId: projectId } })
      .then(bindings => {
        const currentBindings = bindings;

        members.forEach(member => {
          const found = currentBindings.any(m => m.subjectName === member.subjectName &&
            m.projectRoleTemplateId === member.projectRoleTemplateId &&
            m.subjectKind === member.subjectKind
          );
          if (!found) {
            member.projectId = projectId;
            const promise = get(this, 'globalStore').rawRequest({
              url: 'projectroletemplatebinding',
              method: 'POST',
              data: member,
            });
            promises.push(promise);
          }
        });

        return PromiseAll(promises).catch((error) => {
          return reject(error.body.message);
        });
      });
  },
});
