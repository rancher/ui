import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  allServices: Ember.inject.service(),

  actions: {
    cancel() {
      this.sendAction('cancel');
    }
  },

  doSave: function(opt) {
    opt = opt || {};
    if ( !this.get('primaryResource.id') ) {
      opt.url = 'receivers';
    }

    return this._super(opt);
  },

  doneSaving() {
    this.send('cancel');
  },
});
