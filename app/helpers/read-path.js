import Ember from 'ember';

export default Ember.Helper.extend({
  compute([obj, path]/*, hash*/) {
    console.log('read-path',obj,path);
    return Ember.get(obj, path);
  }
});
