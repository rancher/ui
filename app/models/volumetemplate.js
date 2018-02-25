import Resource from 'ember-api-store/models/resource';
import { reference } from 'ember-api-store/utils/denormalize';

var VolumeTemplate = Resource.extend({
  type: 'volumeTemplate',

  stack: reference('stackId'),

  _allVolumes: null,
  volumes: function() {
    let allVolumes = this.get('_allVolumes');
    if ( !allVolumes ) {
      allVolumes = this.get('store').all('volume');
      this.set('_allVolumes', allVolumes);
    }

    return allVolumes.filterBy('volumeTemplateId', this.get('id'));
  }.property(),

  mounts: function() {
    let out = [];
    this.get('volumes').forEach((volume) => {
      out.pushObjects(volume.get('mounts')||[]);
    });
    return out;
  }.property('volumes.@each.mounts'),

  scope: function() {
    if ( this.get('perContainer') ) {
      return 'container';
    } else {
      return 'stack';
    }
  }.property('perContainer'),

  displayNameScope: function() {
    let name = this.get('displayName');
    name += ' (' + this.get('intl').t('volumesPage.scope.'+ this.get('scope')) + ')';
    return name;
  }.property('displayName','scope'),

  availableActions: function() {
    var l = this.get('links');

    return [
      { label: 'action.remove',           icon: 'icon icon-trash',          action: 'promptDelete',      enabled: !!l.remove, altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi',        icon: 'icon icon-external-link',  action: 'goToApi',           enabled: true },
    ];
  }.property('links.{remove}'),
});

VolumeTemplate.reopenClass({
  stateMap: {
    'active':           {icon: 'icon icon-hdd',    color: 'text-success'},
  },
});

export default VolumeTemplate;
