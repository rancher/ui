import { later } from '@ember/runloop';
import Resource from 'ember-api-store/models/resource';
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
    return this['default'] === this.value;
  }),

  canRevert: computed('default', 'isDefault', function() {
    return !isEmpty(this['default']) && !this.isDefault;
  }),

  canEdit: computed('links.update', 'id', function() {
    const id = this.id;

    return !!get(this, 'links.update') && id !== 'cacerts';
  }),

  availableActions: computed('actionLinks.{remove,update}', 'canRevert', function() {
    return [
      {
        label:     'action.revert',
        icon:      'icon icon-history',
        action:    'revert',
        enabled:   this.canRevert,
        altAction: 'bypassRevert'
      },
    ];
  }),
  allowed:      C.SETTING.ALLOWED,
  actions: {
    edit() {
      let key = this.id;
      let obj =  this.settings.findByName(key);
      let details = this.allowed[key];

      this.modalService.toggleModal('modal-edit-setting', {
        key,
        descriptionKey: `dangerZone.description.${ this.id }`,
        kind:           details.kind,
        options:        details.options,
        canDelete:      obj && !obj.get('isDefault'),
        obj,
      });
    },

    revert() {
      let key = this.id;
      let details = this.allowed[key];

      this.modalService.toggleModal('modal-revert-setting', {
        setting: this,
        kind:    details.kind,
      });
    },
    bypassRevert() {
      set(this, 'value', this['default'] || '');

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
