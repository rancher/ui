import Component from '@ember/component';
import layout from './template';
import { alias } from '@ember/object/computed';
import { set, setProperties } from '@ember/object'
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';

export default Component.extend({
  globalStore:                    service(),
  layout,
  model:                          null,
  isLocal:                        null,
  groupRoleBinding:               null,

  tagName:                        'TR',
  classNames:                     'main-row',

  groupPrincipal:                 alias('model'),
  globalRoleBindings:             alias('model.globalRoleBindings'),
  mappedGroupRoleBindingNamesIds: alias('model.mappedGroupRoleBindingNamesIds'),

  init() {
    this._super(...arguments);

    if (!isEmpty(this.model.globalRoleBindings)) {
      if (isEmpty(this.groupRoleBinding)) {
        set(this, 'groupRoleBinding', this.globalStore.createRecord({ type: 'groupGlobalRoleBindings' }));
      }

      setProperties(this, {
        'groupRoleBinding.groupPrincipalId':               this.groupPrincipal.id,
        'groupRoleBinding.groupPrincipalName':             this.groupPrincipal.displayName,
        'groupRoleBinding.globalRoleBindingIds':           this.mappedGroupRoleBindingNamesIds.mapBy('groupRoleBindingId'),
        'groupRoleBinding.mappedGroupRoleBindingNamesIds': this.mappedGroupRoleBindingNamesIds,
      });
    }
  },
});
