import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  tagName: '',
  prefs:   Ember.inject.service(),
  userStore: Ember.inject.service('user-store'),
  id:      null,
  markFavorite: task(function * () {
    var favs = this.get(`prefs.${C.PREFS.HOST_FAVORITES}`) || [];
    // favs.pushObject(this.get('id'));
    debugger;
    // yield this.set(`prefs.${C.PREFS.HOST_FAVORITES}`, favs);
    yield timeout(1000);
    debugger;
  }).drop(),
});
