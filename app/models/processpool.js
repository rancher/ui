import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  displayName: function() {
    return (this.get('name')||'').replace('Executor','').replace('Service','');
  }.property('name'),
});
