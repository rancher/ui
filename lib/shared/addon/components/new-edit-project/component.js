import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { reject, all as PromiseAll } from 'rsvp';
import Component from '@ember/component';
import NewOrEdit from 'ui/mixins/new-or-edit';
import layout from './template';

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

  goBack: function () {
    this.get('router').transitionTo('authenticated.cluster.projects.index');
  },

  validate: function () {
    var errors = this.get('errors', errors) || [];

    if ((this.get('model.project.name') || '').trim().length === 0) {
      errors.push(this.get('intl').findTranslationByKey('projectsPage.new.errors.nameReq'));
    }

    if (!this.get('editing') && this.doesNameExist()) {
      errors.push(this.get('intl').findTranslationByKey('projectsPage.new.errors.nameInExists'));
    }

    if (this.doseMemberNameInvalid()) {
      errors.push(this.get('intl').findTranslationByKey('projectsPage.new.errors.memberNameReq'));
    }

    if (this.doseMemberRoleInvalid()) {
      errors.push(this.get('intl').findTranslationByKey('projectsPage.new.errors.memberRoleReq'));
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

  doSave() {
    if (this.get('editing')) {
      return this.setMembers(this.get('primaryResource'));
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
    const members = this.get('memberArray');
    const promises = [];
    // TODO - wait for setMembers API suppot.
    return this.get('globalStore').findAll('projectRoleTemplateBinding', { forceReload: true })
      .then(bindings => {
        const currentBindings = bindings.filter(b => b.projectId === projectId);

        members.forEach(member => {
          const found = currentBindings.any(m => m.subjectName === member.subjectName &&
            m.projectRoleTemplateId === member.projectRoleTemplateId &&
            m.subjectKind === member.subjectKind
          );
          if (!found) {
            member.projectId = projectId;
            const promise = this.get('globalStore').rawRequest({
              url: 'projectroletemplatebinding',
              method: 'POST',
              data: member,
            });
            promises.push(promise);
          }
        });

        currentBindings.forEach(currentMember => {
          const found = members.any(m => m.subjectName === currentMember.subjectName &&
            m.projectRoleTemplateId === currentMember.projectRoleTemplateId &&
            m.subjectKind === currentMember.subjectKind
          );
          if (!found) {
            const promise = this.get('globalStore').rawRequest({
              url: `projectroletemplatebinding/${currentMember.id}`,
              method: 'DELETE',
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
