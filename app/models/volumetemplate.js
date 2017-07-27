import Resource from 'ember-api-store/models/resource';
import { denormalizeId } from 'ember-api-store/utils/denormalize';

var VolumeTemplate = Resource.extend({
  type: 'volumeTemplate',

  stack: denormalizeId('stackId'),

  _allVolumes: null,
  volumes: function() {
    let allVolumes = this.get('_allVolumes');
    if ( !allVolumes ) {
      allVolumes = this.get('store').all('volume');
      this.set('_allVolumes', allVolumes);
    }

    return allVolumes.filterBy('volumeTempalteId', this.get('id'));
  },

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
    var a = this.get('actionLinks');

    return [
      { label: 'action.remove',           icon: 'icon icon-trash',          action: 'promptDelete',      enabled: !!a.remove, altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi',        icon: 'icon icon-external-link',  action: 'goToApi',           enabled: true },
    ];
  }.property('actionLinks.{remove}'),
});

VolumeTemplate.reopenClass({
  stateMap: {
    'active':           {icon: 'icon icon-hdd',    color: 'text-success'},
  },
});

export default VolumeTemplate;
