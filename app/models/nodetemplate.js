import Resource from 'ember-api-store/models/resource';
import { get, computed } from '@ember/object';


export function registerDisplayLocation(driver, keyOrFn) {
  DISPLAY_LOCATIONS[driver] = keyOrFn;
}

export function registerDisplaySize(driver, keyOrFn) {
  DISPLAY_SIZES[driver] = keyOrFn;
}

// Map of driverName -> [string | function]
//  If string, the given field is retrieved
//  If function, the function is executed with the template as "this"
const DISPLAY_LOCATIONS = {
  aliyunecs: function() {
    return get(this, 'aliyunecsConfig.region') + get(this, 'aliyunecsConfig.zone');
  },
  amazonec2: function() {
    return get(this, 'amazonec2Config.region') + get(this, 'amazonec2Config.zone');
  },
  digitalocean: 'digitaloceanConfig.region',
  exoscale: null,
  packet: 'packetConfig.facilityCode',
  rackspace: 'rackspaceConfig.region',
  vmwarevsphere: null,
}

const DISPLAY_SIZES = {
  aliyunecs: 'aliyunecsConfig.instanceType',
  amazonec2: function() {
    return get(this, 'amazonec2Config.region') + get(this, 'amazonec2Config.zone');
  },
  digitalocean: 'digitaloceanConfig.size',
  exoscale: 'exoscaleConfig.instanceProfile',
  packet: 'packetConfig.plan',
  rackspace: 'rackspaceConfig.flavorId',

  vmwarevsphere: function() {
    return get(this,'vmwarevsphereConfig.memorySize') +' GiB, '+ get(this, 'vmwarevsphereConfig.cpuCount') + ' Core';
  },
}

export default Resource.extend({
  type: 'nodeTemplate',

  availableActions: function() {
    let l = get(this,'links');

    return [
      { label: 'action.edit',       icon: 'icon icon-edit',  action: 'edit',        enabled: !!l.update },
      { divider: true },
      { label: 'action.remove',     icon: 'icon icon-trash',  action: 'promptDelete', enabled: !!l.remove, altAction: 'delete', bulkable: true},
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',action: 'goToApi', enabled: true},
    ];
  }.property('links.{update,remove}'),

  _displayVar(map) {
    const intl = get(this, 'intl');
    const driver = get(this, 'driver');
    const keyOrFn = map[driver];
    if ( keyOrFn ) {
      if ( typeof(keyOrFn) === 'function' ) {
        return keyOrFn.call(this);
      } else {
        return get(this, keyOrFn);
      }
    } else {
      return intl.t('generic.unknown');
    }
  },

  displaySize: computed(function() {
    return this._displayVar(DISPLAY_SIZES);
  }).volatile(),

  displayLocation: computed(function() {
    return this._displayVar(DISPLAY_LOCATIONS);
  }).volatile(),
});
