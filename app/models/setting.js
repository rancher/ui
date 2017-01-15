import Resource from 'ember-api-store/models/resource';

export default Resource.extend({
  isDefault: function() {
    let source = this.get('source');
    if ( !source ) {
      return true;
    }

    return source !== 'Database';
  }.property('source'),
});
