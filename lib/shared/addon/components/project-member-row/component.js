import Component from '@ember/component';
import layout from './template';
import { computed, get, set, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { next } from '@ember/runloop';
import C from 'ui/utils/constants';

const BASIC_ROLES = [
  {
    label: 'Owner',
    value: 'owner',
  },
  {
    label: 'Member',
    value: 'member',
  },
  {
    label: 'Custom',
    value: 'custom',
  },
];

export default Component.extend({
  layout,
  tagName:    'TR',
  classNames: 'main-row',

  member:     null,
  roles:      null,
  owner: null,
  type:  null,
  pageType: null,
  modalService: service('modal'),
  editing: false,
  customRoles: null,
  _customRole: null,
  globalStore: service(),
  role: alias('member.role'),

  init() {
    this._super(...arguments);

    if (get(this, 'member.bindings.length') === 1) {
      set(this, 'roleTemplateId', get(this, 'member.bindings.firstObject'));
    }

  },

  actions: {
    onSelect(selected) {
      if(selected.value === 'custom') {
        next(() => {
          this.openModal(false);
        });
      }
    },
  },

  modalCanceled() {
  },

  doneAdding(customs) {
    if (customs.length === 1) { // more then one? of course its custom
      let match = customs[0];
      if (C.BASIC_ROLE_TEMPLATE_ROLES.includes(match)) {
        setProperties(this, {
          'member.isCustom': false,
          roleTemplateId: match,
        });
      } else {
        setProperties(this, {
          'member.isCustom': true,
          roleTemplateId: 'custom',
        });
      }
    } else {
      setProperties(this, {
        'member.isCustom': true,
        roleTemplateId: 'custom',
      });
    }
    set(this, 'member.bindings', customs);
  },


  openModal(isCustom=false) {
    get(this,'modalService').toggleModal('modal-add-custom-roles', {
      current:       get(this, 'member.bindings'),
      done:          this.doneAdding.bind(this),
      editng:        get(this, 'editing'),
      modalCanceled: this.modalCanceled.bind(this),
      model:         get(this, 'member'),
      roles:         get(this, 'roles'),
      type:          get(this, 'pageType'),
      isCustom:      isCustom,
    });
  },

  roleTemplateId: computed({
    get() {
      return get(this, 'member.isCustom') ?  'custom' : get(this, 'member.bindings.firstObject');
    },

    set(key, value) {
      if (value === 'custom') {
        set(this, '_roleTemplateId', get(this, 'roleTemplateId'));
      } else {
        set(this, 'member.bindings', [ value ])
      }
      return get(this, 'member.isCustom') ?  'custom' : value;
    }
  }),

  choices: computed('roles.[]', 'pageType', function() {
    let pt = get(this, 'pageType');
    if (pt) {
      return BASIC_ROLES.map((r) => {
        return {
          label: r.label,
          value: r.value.indexOf('custom') >= 0 ? 'custom' : `${pt}-${r.value}`
        };

      });
    }
    return [];
  }),

  userList: computed('users.[]', function() {
    return (get(this, 'users')||[]).map(( user ) =>{
      return {
        label: get(user, 'displayName'),
        value: get(user, 'id')
      };
    });
  }),

});
