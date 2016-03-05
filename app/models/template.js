import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  clustering: function() {
    return this.get('templateBase') || 'cattle';
  }.property('templateBase'),
});
