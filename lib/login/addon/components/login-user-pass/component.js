import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  access: service(),
  isCaas: computed('app.mode', function() {
    return this.get('app.mode') === 'caas' ? true : false;
  }),
  waiting: null,

  username: null,
  password: null,

  actions: {
    authenticate: function() {
      var code = this.get('username')+':'+this.get('password');
      this.set('password','');
      this.sendAction('action', code);
    }
  }
});

