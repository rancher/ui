import Resource from 'ember-api-store/models/resource';

var StoragePool = Resource.extend({
  type: 'storagePool',

});

StoragePool.reopenClass({
  alwaysInclude: ['volumes'],
});

export default StoragePool;
