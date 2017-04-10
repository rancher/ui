import Ember from 'ember';
import { task/*, timeout*/ } from 'ember-concurrency';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  tagName: '',
  prefs:   Ember.inject.service(),
  userStore: Ember.inject.service('user-store'),
  id:      null,
  exists: Ember.computed(`prefs.${C.PREFS.HOST_FAVORITES}`, function() {

    var favs = this.get(`prefs.${C.PREFS.HOST_FAVORITES}`);

    if (favs) {
      return favs.contains(this.get('id'));
    }

    return false;
  }),
  markFavorite: task(function * () {
    // Okay i feel the need to explain why im not using the prefs.set directly on this property
    // there are 2 reasons.
    // 1. This will eventually be removed from user prefs and will function more like a regular
    //    transaction with the api.
    // 2. For some reason the set pref functionality returns the value immediately and resolves the
    //    promise of setting the value on its own time without alerting anyone.
    //    The user shouldnt be able to just start clicking favs and never be notified that the call failed.
    //    So with a little hackery we can make this function like a promise should
    var favsPref = this.get('prefs').findByName(C.PREFS.HOST_FAVORITES);
    var favs = null;

    if (favsPref) {
      favs = JSON.parse(favsPref.get('value'));

      if (this.get('exists')) {
        favs.removeObject(this.get('id'));
      } else {
        favs.pushObject(this.get('id'));
      }

      favsPref.set('value', JSON.stringify(favs));

    } else {

      favsPref = this.get('userStore').createRecord({
        type: 'userPreference',
        name: C.PREFS.HOST_FAVORITES,
      });
      favsPref.set('value', JSON.stringify([this.get('id')]));
    }

    try {
        // yield timeout(5000);
      yield favsPref.save();
    } catch (e) {
      console.log(e);
    } finally {
      // if we dont notify the pefs service that the prop changed then the computed props never update
      // again this should be removed when we have a normal api for this call.
      this.get('prefs').notifyPropertyChange(C.PREFS.HOST_FAVORITES);
      this.sendAction('rowRemoved', this.get('id'));
    }
  }).drop(),
});
