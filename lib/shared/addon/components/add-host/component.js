import { sort } from '@ember/object/computed';
import C from 'shared/utils/constants';
import Component from '@ember/component';
import layout from './template';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service'

export default Component.extend({
  layout,
  access:        service(),
  scope:      service('scope'),
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
    if (this.get('driver')) {
      return;
    }

    let want = this.get('hostService.defaultDriver');
    let first = this.get('sortedDrivers.firstObject.name');
    let allowCustom = this.get('allowCustom');
    let driver;

    if ( allowCustom && want === 'custom' ) {
      // You want custom and it's allowed
      driver = want;
    } else if ( !this.get('inModal') && want && this.get('sortedDrivers').map((x) => x.name).includes(want) ) {
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

    this.set('driver', driver);
  },

  actions: {
    switchDriver(name) {
      if (this.get('hostId')) {
        this.set('hostId', null);
        this.set('model.clonedModel', null);
      }
      this.set('driver', name);
    },
    hostSet() {
      this.set('model.apiHostSet', true);
    },
  },

  driverObj: computed('driver', function() {
    return this.get('model.availableDrivers').filterBy('name', this.get('driver'))[0];
  }),

  hasOther: computed('model.availableDrivers.@each.hasUi', function() {
    return this.get('model.availableDrivers').filterBy('hasUi',false).length > 0;
  }),

  allowCustom: function() {
    let cluster = this.get('cluster');

    return this.get(`settings.${C.SETTING.SHOW_CUSTOM_HOST}`) !== false &&
      (!cluster || cluster.get('embedded'));
  }.property(`settings.${C.SETTING.SHOW_CUSTOM_HOST}`,'cluster.embedded'),

  showPicker: computed('model.availableDrivers.length','allowOther','hasOther','allowCustom', function() {
    return !this.get('scope.current.isWindows') && (
            this.get('model.availableDrivers.length') +
            (this.get('allowOther') && this.get('hasOther') ? 1 : 0) +
            (this.get('allowCustom') ? 1 : 0)
          ) > 1;
  }),

  showManage: computed('access.admin','scope.current.isWindows', function() {
    return !this.get('scope.current.isWindows') && this.get('access.admin');
  }),
});
