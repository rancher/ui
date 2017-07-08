import Ember from 'ember';

export default Ember.Component.extend({
  isUpgrade: false,

  headerToken: function() {
    let k = 'editVolume.';
    k += (this.get('isUpgrade') ? 'upgrade' : 'add') + '.';
    k += this.get('model.scope');
    return k;
  }.property('isUpgrade','model.scope'),
});
