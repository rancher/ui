import { sort } from '@ember/object/computed';
import C from 'shared/utils/constants';
import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service'
import Driver from 'shared/mixins/host-driver';
import { get, set } from '@ember/object';

export default Component.extend(Driver,{
  layout,
  access:        service(),
  scope:      service(),
  settings:      service(),
  hostService: service('host'),

  driver:        null,
  cluster:       null,
  hostId:        null,
  allowOther:    true,
  inModal:       false,
  showNameScale: true,
  goBack:        null,

  sortBy:        ['name'],
  sortedDrivers: sort('model.availableDrivers','sortBy'),

  didReceiveAttrs() {
    if (get(this, 'driver')) {
      return;
    }

    let want = get(this, 'hostService.defaultDriver');
    let first = get(this, 'sortedDrivers.firstObject.name');
    let allowCustom = get(this, 'allowCustom');
    let driver;

    if ( allowCustom && want === 'custom' ) {
      // You want custom and it's allowed
      driver = want;
    } else if ( !get(this, 'inModal') && want && get(this, 'sortedDrivers').map((x) => x.name).includes(want) ) {
      // You want something available
      driver = want;
    } else if ( first ){
      // How about the first one
      driver = first;
    } else if ( allowCustom ) {
      // Ok there's no drivers, show custom
      driver = 'custom';
    } else {
      // I give up... show a blank page
    }

    set(this, 'driver', driver);
  },

  actions: {
    switchDriver(name) {
      if (get(this, 'hostId')) {
        set(this, 'hostId', null);
        set(this, 'model.clonedModel', null);
      }
      set(this, 'driver', name);
    },
    hostSet() {
      set(this, 'model.apiHostSet', true);
    },
    doneSaving: function(neu) {
      if (get(this, 'inModal')){
        set(this, 'clusterNodes', neu);
      }
      this.sendAction('goBack');
    },
  },

  requestedClusterId: computed('cluster', function() {
    if(get(this, 'cluster')){
      return get(this, 'cluster.id');
    } else {
      return null;
    }
  }),

  driverObj: computed('driver', function() {
    return get(this, 'model.availableDrivers').filterBy('name', get(this, 'driver'))[0];
  }),

  hasOther: computed('model.availableDrivers.@each.hasUi', function() {
    return get(this, 'model.availableDrivers').filterBy('hasUi',false).length > 0;
  }),

  allowCustom: function() {
    let cluster = get(this, 'cluster');

    return get(this, `settings.${C.SETTING.SHOW_CUSTOM_HOST}`) !== false &&
      (!cluster || cluster.get('embedded'));
  }.property(`settings.${C.SETTING.SHOW_CUSTOM_HOST}`,'cluster.embedded'),

  showPicker: computed('model.availableDrivers.length','allowOther','hasOther','allowCustom', function() {
    return !get(this, 'scope.currentProject.isWindows') && (
            get(this, 'model.availableDrivers.length') +
            (get(this, 'allowOther') && get(this, 'hasOther') ? 1 : 0) +
            (get(this, 'allowCustom') ? 1 : 0)
          ) > 1;
  }),

  showManage: computed('access.admin','scope.currentProject.isWindows', function() {
    return !get(this, 'scope.currentProject.isWindows') && get(this, 'access.admin');
  }),
});
