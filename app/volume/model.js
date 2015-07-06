import Resource from 'ember-api-store/models/resource';

var Volume = Resource.extend({
  type: 'volume'
});

Volume.reopenClass({
  alwaysInclude: ['mounts']
});

export default Volume;
