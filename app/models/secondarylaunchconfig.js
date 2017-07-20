import Resource from 'ember-api-store/models/resource';

var SecondaryLaunchConfig = Resource.extend({
  displayImage: function() {
    return (this.get('imageUuid')||'').replace(/^docker:/,'');
  }.property('imageUuid'),
});

export default SecondaryLaunchConfig;
