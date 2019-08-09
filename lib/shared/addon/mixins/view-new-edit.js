import Mixin from '@ember/object/mixin'
import NewOrEdit from './new-or-edit';
import { computed, get, set } from '@ember/object'
import { equal, or, alias } from '@ember/object/computed'
import { inject as service } from '@ember/service';

export const VIEW = 'view';
export const NEW  = 'new';
export const EDIT = 'edit';

export default Mixin.create(NewOrEdit, {
  intl: service(),

  titleKey:   null,
  inlineEdit: false,

  isView:  equal('mode', VIEW),
  isNew:   equal('mode', NEW),
  isEdit:  equal('mode', EDIT),
  notView: or('isNew', 'isEdit'),
  editing: alias('notView'),

  actions: {
    inlineEdit() {
      set(this, 'mode', EDIT);
      set(this, 'inlineEdit', true);
    },

    viewEditCancel() {
      if ( get(this, 'inlineEdit') ) {
        set(this, 'inlineEdit', false);
        set(this, 'mode', VIEW);
      } else {
        if (this.cancel) {
          this.cancel();
        }
      }
    },
  },

  isClone: computed('mode', 'primaryResource.{id,name}', function() {
    const pr = get(this, 'primaryResource');
    const created = pr.hasOwnProperty('created');
    const tpof = typeof pr.created;

    let isClone = false;

    if (created && ( tpof !== null || tpof !== undefined )) {
      isClone = true;
    }

    return isClone;
  }),

  title: computed('mode', 'primaryResource.displayName', 'titleKey', function() {
    const prefix = get(this, 'titleKey');
    const mode = get(this, 'mode');
    const intl = get(this, 'intl');

    let name = get(this, 'originalModel.displayName')
            || get(this, 'primaryResource.displayName')
            || '';

    return intl.t(`${ prefix }.${ mode }`, { name });
  }),

  doneSaving() {
    if (this.done) {
      this.done();
    }

    return this._super(...arguments);
  },
});
