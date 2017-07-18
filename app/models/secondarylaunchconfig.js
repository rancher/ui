import Resource from 'ember-api-store/models/resource';

var SecondaryLaunchConfig = Resource.extend({
  displayImage: function() {
    return (this.get('imageUuid')||'').replace(/^docker:/,'');
  }.property('imageUuid'),
});

SecondaryLaunchConfig.reopenClass({
  mangleIn(data) {
    if (data.hasOwnProperty('init')) {
      data._init = data.init;
      delete data.init;
    }
    return data;
  },
  mangleOut(data) {
    if (data.hasOwnProperty('_init')) {
      data.init = data._init;
      delete data._init;
    }
    return data;
  }

});

export default SecondaryLaunchConfig;
