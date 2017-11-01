import Ember from 'ember';

export default Ember.Helper.extend({
  compute(params, options) {
    let separator = options.separator || ', ';
    return (params[0]||[]).join(separator);
  },
});
