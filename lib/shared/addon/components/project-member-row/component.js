import Errors from 'ui/utils/errors';
import Component from '@ember/component';
import layout from './template';
import { computed, get, set, setProperties, observer } from '@ember/object';
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
  // customRoles: null,
  _customRole: null,
  globalStore: service(),
  role: alias('member.role'),
  errors: null,
  principal: null,
  external: null,
  noUpdate: false,


  principalChanged: observer('principal', 'member', function() {
    let principal = (get(this, 'principal'));

    if (principal) {
      set(this, 'member.principalId', get(principal, 'id'));
      set(this, 'member.memberType', get(principal, 'principalType'));
    }
  }),


  init() {
    this._super(...arguments);
    let member = get(this, 'member');

    if (get(this, 'member.bindings.length') === 1) {
      set(this, 'roleTemplateId', get(this, 'member.bindings.firstObject'));
    }

    // if (member && get(member, 'principalId')) {
    if (member) {
      if (get(member, 'bindings.length') !== 0) { // new
        set(this, 'noUpdate', true);
      }
      if ( get(member, 'principalId') ) {
        get(this, 'globalStore').rawRequest({
          url: `principals/${encodeURIComponent(get(member, 'principalId'))}`,
          method: 'GET',
        }).then((xhr) => {
          if ( xhr.status === 204 ) {
            return;
          }

          if ( xhr.body && typeof xhr.body === 'object') {
            set(this, 'principal', set(this, 'external', xhr.body));
            this.principalChanged();
          }
          return xhr;
        }).catch((xhr) => {
          set(this, 'errors', [`${xhr.status}: ${xhr.statusText}`]);
          return xhr;
        });
      }
      this.principalChanged();
    }
  },

  actions: {
    gotError: function(err) {
      set(this, 'errors', [Errors.stringify(err)]);
    },
    addAuthorized: function(principal) {
      set(this, 'principal', principal);
    },
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
      roles:         get(this, 'builtInRoles'),
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

  builtInRoles: computed('roles.[]', function() {
    return get(this, 'roles').filter(r => r.builtin || r.external);
  }),

  customRoles: computed('roles.[]', function() {
    return get(this, 'roles').filter(r => !r.builtin && !r.external && !r.hidden);
  }),

  choices: computed('roles.[]', 'pageType', function() {
    let pt = get(this, 'pageType');
    if (pt) {
      let customRoles = get(this, 'customRoles').map( r => {
        return {
          label: r.name,
          value: r.id
        }
      });
      let neuRoles = BASIC_ROLES.map((r) => {
        return {
          label: r.label,
          value: r.value.indexOf('custom') >= 0 ? 'custom' : `${pt}-${r.value}`
        };

      });
      neuRoles = neuRoles.concat(customRoles);
      return neuRoles;
    }
    return [];
  }),
});
