import { computed } from '@ember/object';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import C from 'ui/utils/constants';
import layout from './template';

let DEFAULT_TIME = 400;

export default Component.extend(ModalBase, {
  layout,
  prefs     : service(),
  classNames: ['generic', 'medium-modal'],
  settings: service(),
  access: service(),

  isAdmin: alias('access.admin'),

  containerCount: function() {
    let count = this.get('pods.length');
    if ( count > 9 ) {
      return count;
    } else {
      return '0' + count;
    }
  }.property('pods.length'),

  time: DEFAULT_TIME,
  timer: null,

  currentTheme: computed(`prefs.${C.PREFS.THEME}`, function() {
    return this.get(`prefs.${C.PREFS.THEME}`);
  }),


  init() {
    this._super(...arguments);
    this.set('pods', this.get('store').all('pod'));

    this.set('timer', setInterval(() => {
      this.updateTime();
    }, 1000));
  },

  updateTime() {
    let time = this.get('time');
    if ( time > 0 ) {
      time--;
    } else {
      time = DEFAULT_TIME;
    }

    this.set('time', time);
  },

  willDestroyElement() {
    clearInterval(this.get('timer'));
  },
});
