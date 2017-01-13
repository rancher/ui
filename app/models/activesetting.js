import Resource from 'ember-api-store/models/resource';

var ActiveSetting = Resource.extend({
  isDefault: function() {
    let source = this.get('source');
    if ( !source ) {
      return true;
    }

    return source !== 'Database';
  }.property('source'),
});

export default ActiveSetting;
