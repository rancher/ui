import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import { get, set, computed, setProperties } from '@ember/object';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ChildHook from 'shared/mixins/child-hook';
import { isEmpty } from '@ember/utils';

const M_CONFIG = {
  type:                  'projectRoleTemplateBinding',
  subjectKind:           '',
  userId:                '',
  projectRoleTemplateId: '',
  projectId:             '',
};

export default Component.extend(NewOrEdit, ChildHook, {
  intl:                        service(),
  router:                      service(),
  globalStore:                 service(),
  layout,
  memberConfig:                M_CONFIG,
  model:                       null,
  isNew:                       false,

  primaryResource:             alias('model.project'),
  policies:                    alias('model.policies'),
  init() {
    this._super(...arguments);
    let bindings = (get(this, 'model.project.projectRoleTemplateBindings') || []).slice();

    bindings = bindings.filter((x) => get(x, 'name') !== 'creator');
    set(this, 'memberArray', bindings);
    if (isEmpty(get(this, 'primaryResource.id'))) {
      set(this, 'isNew', true);
    }
  },

  actions: {
    cancel() {
      this.goBack();
    },

    expandFn() {
    },

    updateQuota(quota) {
      const primaryResource = this.primaryResource;

      if ( quota ) {
        setProperties(primaryResource, quota);
      } else {
        setProperties(primaryResource, {
          resourceQuota:                 null,
          namespaceDefaultResourceQuota: null,
        });
      }
    },

    updateContainerDefault(limit) {
      const primaryResource = this.primaryResource;

      set(primaryResource, 'containerDefaultResourceLimit', limit);
    },
  },

  creator:         computed('editing', 'model.{me,users}', 'primaryResource.creatorId', function() {
    let cid = get(this, 'primaryResource.creatorId');
    let creator = null;

    if (this.editing) {
      let users = get(this, 'model.users');

      creator = users.findBy('id', cid) || users.findBy('username', cid); // TODO 2.0 must do because first clusters and projects are given admin as the creator id which is not the admins userid
    } else {
      creator = get(this, 'model.me');
    }

    return creator;
  }),

  goBack() {
    this.router.transitionTo('authenticated.cluster.projects.index');
  },

  validate() {
    this._super();

    const errors = this.errors || [];

    const intl = this.intl;

    const resourceQuota = get(this, 'primaryResource.resourceQuota.limit') || {};
    const nsResourceQuota = get(this, 'primaryResource.namespaceDefaultResourceQuota.limit') || {};

    Object.keys(nsResourceQuota).forEach((key) => {
      if ( nsResourceQuota[key] && !resourceQuota[key] ) {
        errors.push(intl.t('formResourceQuota.errors.projectLimitRequired', { resource: intl.t(`formResourceQuota.resources.${ key }`) }));
      }
    })

    Object.keys(resourceQuota).forEach((key) => {
      if ( resourceQuota[key] && !nsResourceQuota[key] ) {
        errors.push(intl.t('formResourceQuota.errors.nsDefaultLimitRequired', { resource: intl.t(`formResourceQuota.resources.${ key }`) }));
      }
    })

    set(this, 'errors', errors);

    return get(this, 'errors.length') === 0;
  },

  doneSaving() {
    this.goBack();
  },

  doSave(opt) {
    opt = opt || {};
    opt.qp = { '_replace': 'true' };

    return this._super(opt);
  },
});
