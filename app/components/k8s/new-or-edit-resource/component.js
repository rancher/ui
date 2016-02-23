import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  k8s: Ember.inject.service(),

  label: null,
  primaryResource: null,
  editing: false,

  actions: {
    done() {
      this.sendAction('done');
    },

    cancel() {
      this.sendAction('cancel');
    },
  },

  didInsertElement() {
    this.$("textarea")[0].focus();
  },

  validate() {
    this.set('errors',[]);
    return true;
  },

  doSave() {
    if ( this.get('editing') )
    {
      return this.get('k8s').edit(this.get('primaryResource.body'));
    }
    else
    {
      return this.get('k8s').create(this.get('primaryResource.body'));
    }
  },

  doneSaving() {
    this.sendAction('done');
  },
});
