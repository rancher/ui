import Mixin from '@ember/object/mixin';
import { get } from '@ember/object';
import NewOrEdit from 'ui/mixins/new-or-edit';


export default Mixin.create(NewOrEdit, {
  memberConfig:      null,
  memberArray:       null,
  callback: null,
  actions: {
    initAlert(boundFn) {
      this.set('callback', boundFn);
    },
  },

  alertChildDidSave() {
    const callback = get(this, 'callback');
    if ( callback ) {
      return callback();
    }
  },

  didSave() {
    const pr = get(this, 'primaryResource');
    return this.alertChildDidSave().then(() => {
      return pr;
    });
  },

  doneSaving() {
    this.goBack();
  },
});
