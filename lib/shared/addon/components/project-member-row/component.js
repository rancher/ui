import Errors from 'ui/utils/errors';
import Component from '@ember/component';
import layout from './template';
import {
  computed, get, set, setProperties, observer
} from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { next } from '@ember/runloop';
import C from 'ui/utils/constants';
import Identicon from 'identicon.js';

const BASIC_ROLES = [
  {
    label:      'Owner',
    value:      'owner',
    typePrefix: true,
  },
  {
    label:      'Member',
    value:      'member',
    typePrefix: true,
  },
  {
    label: 'Read Only',
    value: 'read-only',
    scope: 'project',
  },
  {
    label:   'Custom',
    value:   'custom',
    virtual: true,
  },
];

export default Component.extend({
  modalService:         service('modal'),
  globalStore:          service(),
  layout,
  tagName:              'TR',
  classNames:           'main-row',

  member:               null,
  roles:                null,
  type:                 null,
  pageType:             null,
  editing:              false,
  // customRoles:       null,
  _customRole:          null,
  errors:               null,
  principal:            null,
  external:             null,
  noUpdate:             false,
  isCreatorMember:      false,
  principalId:          null,
  principalGravatarSrc: null,


  role:                 alias('member.role'),
  init() {
    this._super(...arguments);
    let member = get(this, 'member');

    if (get(this, 'member.bindings.length') === 1) {
      set(this, 'roleTemplateId', get(this, 'member.bindings.firstObject'));
    }

    if (member) {
      if (get(member, 'bindings.length') !== 0) { // new
        set(this, 'noUpdate', true);
      }
      if ( get(member, 'principalId') ) {
        get(this, 'globalStore').rawRequest({
          url:    `principals/${ encodeURIComponent(get(member, 'principalId')) }`,
          method: 'GET',
        }).then((xhr) => {
          if ( xhr.status === 204 ) {
            return;
          }

          if ( xhr.body && typeof xhr.body === 'object') {
            let nuePrincipal = this.globalStore.createRecord(xhr.body);

            set(this, 'principal', nuePrincipal);

            this.principalChanged();
          }

          return xhr;
        }).catch((xhr) => {
          if (get(member, 'principalId')) {
            set(this, 'principalId', get(member, 'principalId'));
            set(this, 'principalGravatarSrc', `data:image/png;base64,${ new Identicon(AWS.util.crypto.md5(get(member, 'principalId') || 'Unknown', 'hex'), 80, 0.01).toString() }`)
          }

          return xhr;
        });
      }
      this.principalChanged();
    }
  },

  actions: {
    gotError(err) {
      set(this, 'errors', [Errors.stringify(err)]);
    },
    addAuthorized(principal) {
      set(this, 'principal', principal);
    },
    onSelect(selected) {
      if (selected.value === 'custom') {
        next(() => {
          this.openModal(false);
        });
      }
    },
    remove() {
      this.remove(this.member);
    },
  },

  principalChanged: observer('principal', 'member', function() {
    let principal = (get(this, 'principal'));

    if (principal) {
      set(this, 'member.principalId', get(principal, 'id'));
      set(this, 'member.memberType', get(principal, 'principalType'));
    }
  }),

  roleTemplate: computed('roleTemplateId', 'roles.[]', function() {
    return (get(this, 'roles') || []).findBy('id', get(this, 'roleTemplateId'));
  }),


  roleTemplateId: computed({
    get() {
      return get(this, 'member.isCustom') ?  'custom' : get(this, 'member.bindings.firstObject');
    },

    set(key, value) {
      if (value === 'custom') {
        set(this, '_roleTemplateId', get(this, 'roleTemplateId'));
      } else {
        set(this, 'member.bindings', [value])
      }

      return value;
    }
  }),

  builtInRoles: computed('roles.[]', function() {
    return get(this, 'roles').filter((r) => ( r.builtin || r.external ) && r.id !== 'read-only');
  }),

  customRoles: computed('roles.[]', function() {
    return get(this, 'roles').filter((r) => !r.builtin && !r.external && !r.hidden);
  }),

  choices: computed('roles.[]', 'pageType', function() {
    const pt = get(this, 'pageType');
    const allRoles = get(this, 'globalStore').all('roleTemplate');

    let neuRoles = BASIC_ROLES.map((r) => {
      const id = (r.typePrefix ? `${ pt }-${ r.value }` : r.value);
      const rt = allRoles.findBy('id', id )

      if ( r.scope && r.scope !== pt ) {
        return;
      }

      // If it's a real entry (i.e. not "custom")
      if ( !r.virtual ) {
        // And there's no corresponding role, or there is one but it's locked
        if (!rt || get(rt, 'locked') === true) {
          // And it's not the currently selected role
          if ( id !== get(this, 'roleTemplateId') ) {
            // Hide this entry (return nothing instead of a row)
            return;
          }
        }
      }

      return {
        label: r.label,
        value: id,
      };
    }).filter((x) => !!x);

    if ( pt ) {
      let customRoles = get(this, 'customRoles').map( (r) => {
        if (r.id === 'read-only') {
          return;
        } else {
          return {
            label: r.name,
            value: r.id
          }
        }
      });

      neuRoles = neuRoles.concat(customRoles);

      return neuRoles.filter((x) => !!x);
    }

    return neuRoles;
  }),

  modalCanceled() {
  },

  remove(/* member */) {
    // remove is not required as the noUpdate case will not allow you to remove a member
  },

  doneAdding(customs) {
    if (customs.length === 1) { // more then one? of course its custom
      let match = customs[0];

      if (C.BASIC_ROLE_TEMPLATE_ROLES.includes(match)) {
        setProperties(this, {
          'member.isCustom': false,
          roleTemplateId:    match,
        });
      } else {
        setProperties(this, {
          'member.isCustom': true,
          roleTemplateId:    'custom',
        });
      }
    } else {
      setProperties(this, {
        'member.isCustom': true,
        roleTemplateId:    'custom',
      });
    }
    set(this, 'member.bindings', customs);
  },


  openModal(isCustom = false) {
    get(this, 'modalService').toggleModal('modal-add-custom-roles', {
      current:       get(this, 'member.bindings'),
      done:          this.doneAdding.bind(this),
      editng:        get(this, 'editing'),
      modalCanceled: this.modalCanceled.bind(this),
      model:         get(this, 'member'),
      roles:         get(this, 'builtInRoles'),
      type:          get(this, 'pageType'),
      isCustom,
    });
  },

});
