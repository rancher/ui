import Resource from 'ember-api-store/models/resource';

var VolumeTemplate = Resource.extend({
  type: 'volumeTemplate',
});

VolumeTemplate.reopenClass({
  stateMap: {
    'active':           {icon: 'icon icon-hdd',    color: 'text-success'},
  },
});

export default VolumeTemplate;
