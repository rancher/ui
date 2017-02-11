import Ember from 'ember';
import fetch from 'ember-api-store/utils/fetch';

export default Ember.Controller.extend({
  emailSent: false,
  saving: false,
  saveDisabled: true,
  init() {
    this._super(...arguments);
    this.set('model', {
      type: 'account',
      kind: 'user',
      name: '',
      email: '',
    });
  },
  actions: {
    register: function(cb) {
      this.set('saving', true);

      fetch('/register-new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.get('model'))
      }).then(() => {
        this.set('saving', false);
        this.set('emailSent', true);
        cb(true);
      }).catch(() => {
        this.set('saving', false);
        cb(false);
      });
    },
    cancel: function() {
      this.transitionToRoute('login');
    }
  },
  validate: Ember.observer('model.name', 'model.email', function() {
    if (this.get('model.name') && this.get('model.email')) {
      this.set('saveDisabled', false);
    } else {
      this.set('saveDisabled', true);
    }
  })

});
