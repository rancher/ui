import Ember from 'ember';

export default Ember.Helper.extend({
  compute(params/*, options*/) {
    return JSON.stringify(params[0]);
  },
});
