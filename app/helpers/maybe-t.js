import Ember from 'ember';

export default Ember.Helper.extend({
  intl: Ember.inject.service(),

  compute(params) {
    let key = params[0];
    let fallback = params[1];

    if ( key ) {
      return this.get('intl').t(key);
    } else {
      return fallback;
    }
  }
});
