import Ember from 'ember';
import NewOrEdit from 'ui/mixins/new-or-edit';

export default Ember.Component.extend(NewOrEdit, {
  settings: Ember.inject.service(),

  originalModel   : null,
  primaryResource : Ember.computed.alias('originalModel'),
  errors          : null,

  actions: {
    cancel: function() {
      this.sendAction('dismiss');
    },
  },

  didRender() {
    setTimeout(() => {
      this.$('INPUT')[0].focus();
    }, 500);
  },

  validate() {
    this._super();
    var errors = this.get('errors', errors) || [];

    if (!this.get('originalModel.name')) {
      errors.push('Driver name is requried');
    }

    if (!this.get('originalModel.uri')) {
      errors.push('Driver URI is requried');
    }

    this.set('errors', errors);
    return this.get('errors.length') === 0;
  },

  doneSaving() {
    this.sendAction('dismiss');
  }
});
