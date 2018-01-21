import Component from '@ember/component'
import { all as PromiseAll } from 'rsvp';
import { inject as service } from '@ember/service';
import { get, set, setProperties } from '@ember/object';
import layout from './template';
import NewOrEdit from 'ui/mixins/new-or-edit';

const CUSTOM = 'custom';

export default Component.extend(NewOrEdit,{
  layout,
  globalStore: service(),

  user: null,
  primaryResource: null,

  mode: null,
  custom: null,
  editing: false,
  type: null,
  cTyped: null,
  stdUser: null,
  admin: null,

  init() {
    this._super(...arguments);
    let mode = null;
    let editing = get(this, 'editing');
    let dfu = get(this, 'defaultUser');
    let current = dfu.get(`${get(this, 'type')}RoleBindings`);
    let custom  = get(this, 'model.roles').filterBy('hidden', false).filter((role) => {
      return role.get('id') !== `${get(this, 'type')}-admin`
        && role.get('id') !== `${get(this, 'type')}-owner`
        && role.get('id') !== `${get(this, 'type')}-member`
        && role.get('context') === `${get(this, 'type')}`;
    }).map((role) => {
      const binding = current.findBy('roleTemplateId', get(role, 'id')) || null;
      return {
        role,
        active: !!binding,
        existing: binding,
      }
    });
    if (editing && current.length === 1) {
      mode = get(current, 'firstObject.roleTemplateId');
    } else if (editing && current.length > 1){
      mode = CUSTOM;
    } else {
      mode = `${get(this, 'type')}-member`;
    }
    let model = {
      type: `${get(this, 'type')}RoleTemplateBinding`,
      subjectKind: 'User',
      subjectName: null,
    };
    set(model, `${get(this, 'type')}Id`, get(this, `model.${get(this, 'type')}.id`))
    setProperties(this, {
      primaryResource: this.make(model),
      defaultUser: dfu,
      custom: custom,
      mode: mode,
      stdUser: `${get(this, 'type')}-member`,
      admin: `${get(this, 'type')}-owner`,
      cTyped: get(this, 'type').capitalize()
    });
  },

  make(role) {
    return get(this, 'globalStore').createRecord(role);
  },

  actions: {
    save() {
      let mode = get(this, 'mode');
      let add = [];
      let remove = [];
      let pr = get(this, 'primaryResource');
      const custom = get(this, 'custom');

      switch ( mode ) {
      case `${get(this, 'type')}-owner`:
      case `${get(this, 'type')}-member`:
        set(pr, 'roleTemplateId', mode);
        add = [ pr ];
        break;
      case CUSTOM:
        add = custom.filterBy('active',true ).filterBy('existing',null).map((x) => {
          let neu = get(this, 'primaryResource').clone();
          set(neu, 'roleTemplateId', get(x, 'role.id'));
          return neu;
        });
        remove = custom.filterBy('active',false).filterBy('existing').map(y => y.existing);
        break;
      }


      return PromiseAll(add.map(x => x.save())).then(() => {
        return PromiseAll(remove.map(x => x.delete())).then(() => {
          return this.doneSaving();
        });
      });
    },

  }

});
