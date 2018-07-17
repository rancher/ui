import { observer } from '@ember/object';
import { on } from '@ember/object/evented';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import fetch from 'ember-api-store/utils/fetch';

export default Component.extend({
  intl: service(),

  classNames:        ['caas-login', 'text-left'],
  userEmail:         null,
  passwordResetSent: false,
  showSuccess:       false,
  saveDisabled:      true,

  showReset: alias('promptReset'),
  emailObsv: on('init', observer('userEmail', function() {
    if (this.get('userEmail')) {
      this.set('errMsg', null);
      this.set('saveDisabled', false);
    } else {
      this.set('saveDisabled', true);
    }
  })),
  actions: {
    toggleReset(e) {
      e.preventDefault();
      this.toggleProperty('showReset');
    },
    cancel() {
      this.setProperties({
        userEmail:   null,
        errMsg:      null,
        showReset:   false,
        showSuccess: false,
      });
    },
    resetPw() {
      if (this.validateEmail(this.get('userEmail'))) {
        this.set('loading', true);
        fetch('/reset-password', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ email: this.get('userEmail') })
        }).then(() => {
          this.set('loading', false);
          this.set('showSuccess', true);
        }).catch(() => {
          this.set('errMsg', this.get('intl').t('caasLogin.error'));
          this.set('loading', false);
        });
      } else {
        this.set('loading', false);
        this.set('errMsg', this.get('intl').t('caasLogin.invalidEmail'));
      }
    }
  },
  validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return re.test(email);
  }
});
