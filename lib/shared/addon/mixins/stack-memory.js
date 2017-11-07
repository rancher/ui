import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import C from 'ui/utils/constants';

export default Mixin.create({
  prefs: service(),
  stack: null,
  init() {
    this._super(...arguments);
    this.setStack();
  },
  setStack() {
    let stackId = this.get(`prefs.${C.PREFS.LAST_STACK}`) || null;
    if (stackId) {
      this.set('stack', this.get('store').getById('stack', stackId));
    }
  },
  doneSaving() {
    if (this.get('stack')) {
      this.set(`prefs.${C.PREFS.LAST_STACK}`, this.get('stack.id'));
    }
    this.send('done');
  },
});
