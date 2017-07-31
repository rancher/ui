import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';
import C from 'ui/utils/constants';

let DEFAULT_TIME = 400;

export default Ember.Component.extend(ModalBase, {
  prefs     : Ember.inject.service(),
  classNames: ['generic', 'medium-modal'],
  settings: Ember.inject.service(),
  access: Ember.inject.service(),

  isAdmin: Ember.computed.alias('access.admin'),

  containerCount: Ember.computed.alias('containers.length'),
  time: DEFAULT_TIME,
  timer: null,

  currentTheme: Ember.computed(`prefs.${C.PREFS.THEME}`, function() {
    return this.get(`prefs.${C.PREFS.THEME}`);
  }),


  init() {
    this._super(...arguments);
    this.set('containers', this.get('store').all('container'));

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
