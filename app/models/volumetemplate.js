import Ember from 'ember';
import Resource from 'ember-api-store/models/resource';

var VolumeTemplate = Resource.extend({
  type: 'volumeTemplate',
});

TemplateVolume.reopenClass({
  stateMap: {
    'active':           {icon: 'icon icon-hdd',    color: 'text-success'},
  },
});

export default VolumTemplatee;
