import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default Component.extend({
  layout,
  tagName: '',
  globalStore: service(),
  memberArray: null,
  project: null,
  editing: false,
  type: null,
  roles: null,
  model: null,
  memberConfig: null,
  actions: {
    cancel() {
      this.goBack();
    },
    addMember(kind) {
      let config = get(this, 'memberConfig');
      set(config, 'subjectKind', kind);
      get(this,'memberArray').pushObject(get(this,'globalStore').createRecord(config));
    },
    removeMember(obj) {
      get(this,'memberArray').removeObject(obj);
    },
  },

  didReceiveAttrs() {
    if (!get(this,'editing')) {
      this.send('addMember', 'User');
    }
  },
  doesNameExist() {
    const project = get(this,'project');
    const currentProjects = get(this,'model.projects');

    if (currentProjects.findBy('name', project.get('name'))) {
      return true;
    }

    return false;
  },

  doseMemberNameInvalid() {
    const members = get(this,'memberArray');
    return members.any(r => r.subjectName.length === 0);
  },

  doseMemberRoleInvalid() {
    const members = get(this,'memberArray');
    const type = get(this, 'memberConfig.type') === 'projectRoleTemplateBinding' ? 'projectRoleTemplateId' : 'roleTemplateId';
    return members.any(( r ) => {
      return get(r, `${type}.length`) === 0;
    });
  },

});
