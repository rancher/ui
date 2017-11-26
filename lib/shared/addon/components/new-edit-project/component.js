import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { reject, all as PromiseAll } from 'rsvp';
import Component from '@ember/component';
import NewOrEdit from 'ui/mixins/new-or-edit';
import layout from './template';

export default Component.extend(NewOrEdit, {
  layout,
  intl: service(),
  router: service(),
  authzStore: service('authz-store'),
  model: null,

  primaryResource: alias('model.project'),
  memberArray: alias('model.projectRoleTemplateBindings'),

  actions: {
    cancel() {
      this.goBack();
    },
    addMember(kind) {
      this.get('memberArray').pushObject({
        subjectKind: kind,
        subjectName: '',
        projectRoleTemplateId: '',
        projectId: '',
      });
    },
    removeMember(obj) {
      this.get('memberArray').removeObject(obj);
    },
  },

  goBack: function () {
    this.get('router').transitionTo('/projects');
  },

  doesNameExist() {
    const project = this.get('primaryResource');
    const currentProjects = this.get('model.projects');

    if (currentProjects.findBy('name', project.get('name'))) {
      return true;
    }

    return false;
  },

  doseMemberNameInvalid() {
    const members = this.get('memberArray');
    return members.any(r => r.subjectName.length === 0);
  },

  doseMemberRoleInvalid() {
    const members = this.get('memberArray');
    return members.any(r => r.projectRoleTemplateId.length === 0);
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
    return this._super.apply(this, arguments).then((project) => {
      const projectId = project.id;
      const members = this.get('memberArray');
      const promises = [];
      members.forEach(member => {
        member.projectId = projectId;
        const promise = this.get('authzStore').rawRequest({
          url: 'projectroletemplatebinding',
          method: 'POST',
          data: member,
        });
        promises.push(promise);
      });
      return PromiseAll(promises).catch((error) => {
        return reject(error.body.message);
      });
    });
  },

  doneSaving() {
    this.goBack();
  },
});