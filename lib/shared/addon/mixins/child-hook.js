import Mixin from '@ember/object/mixin';
import { get, set } from '@ember/object';
import { all } from 'rsvp';

const KEY = '_childHooks';

export default Mixin.create({
  [KEY]: null,

  init() {
    this._super(...arguments);
    set(this, KEY, []);
  },

  actions: {
    registerHook(boundFn, name='default', priority=99) {
      const hooks = get(this, KEY);
      let entry = hooks.findBy('name',name);
      if ( !entry ) {
        entry = { name };
        hooks.push(entry);
      }

      entry.fn = boundFn;
      entry.priority = priority;
    },
  },

  applyHooks() {
    const hooks = get(this, KEY) || [];

    const promises = hooks.sortBy('priority','name').map(hook => {
      return {name: hook.name, res: hook.fn()};
    });

    return all(promises);
  }
});
