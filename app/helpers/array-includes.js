import Ember from 'ember';

export default Ember.Helper.extend({
  _haystack: null,

  shouldUpdate: Ember.observer('_haystack.[]', function(){
    this.recompute();
  }),

  compute(params) {
    let haystack = params[0];
    let needle = params[1];

    if (!haystack) {
      return;
    }

    let _haystack = this.get('_haystack');
    if (haystack !== _haystack) {
      _haystack = new Ember.A(haystack);
      this.set('_haystack', _haystack);
    }
    return _haystack.includes(needle);
  }
});
