import { later } from '@ember/runloop';
import Resource from '@rancher/ember-api-store/models/resource';
import { computed, get, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import C from 'ui/utils/constants';

export default Resource.extend({
  modalService: service('modal'),
  settings:     service(),
  type:         'setting',
  canRemove:    false,

  isDefault: computed('value', 'default', function() {
    return get(this, 'default') === get(this, 'value');
  }),

  canRevert: computed('default', 'isDefault', function() {
    return !isEmpty(get(this, 'default')) && !get(this, 'isDefault');
  }),

  canEdit: computed('links.update', 'id', function() {
    const id = get(this, 'id');

    return !!get(this, 'links.update') && id !== 'cacerts';
  }),

  availableActions: computed('actionLinks.{update,remove}', function() {
    return [
      {
        label:     'action.revert',
        icon:      'icon icon-history',
        action:    'revert',
        enabled:   get(this, 'canRevert'),
        altAction: 'bypassRevert'
      },
    ];
  }),
  allowed:      C.SETTING.ALLOWED,
  actions: {
    edit() {
      let key = get(this, 'id');
      let obj =  this.get('settings').findByName(key);
      let details = this.get('allowed')[key];

      this.get('modalService').toggleModal('modal-edit-setting', {
        key,
        descriptionKey: `dangerZone.description.${ get(this, 'id') }`,
        kind:           details.kind,
        options:        details.options,
        canDelete:      obj && !obj.get('isDefault'),
        obj,
      });
    },

    revert() {
      let key = get(this, 'id');
      let details = this.get('allowed')[key];

      this.get('modalService').toggleModal('modal-revert-setting', {
        setting: this,
        kind:    details.kind,
      });
    },
    bypassRevert() {
      set(this, 'value', get(this, 'default') || '');

      this.save();
    },
  },

  delete() {
    return this._super().then((res) => {
      later(this, 'reload', 500);

      return res;
    });
  },
});
