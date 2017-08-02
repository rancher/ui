import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  access:        Ember.inject.service(),
  projects:      Ember.inject.service(),
  settings:      Ember.inject.service(),
  hostService: Ember.inject.service('host'),

  driver:        null,
  hostId:        null,
  allowOther:    true,
  forCatalog:    true,
  inModal:       false,
  showNameScale: true,
  goBack:        null,

  sortBy:        ['name'],
  sortedDrivers: Ember.computed.sort('model.availableDrivers','sortBy'),

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

  driverObj: Ember.computed('driver', function() {
    return this.get('model.availableDrivers').filterBy('name', this.get('driver'))[0];
  }),

  hasOther: Ember.computed('model.availableDrivers.@each.hasUi', function() {
    return this.get('model.availableDrivers').filterBy('hasUi',false).length > 0;
  }),

  allowCustom: function() {
    return this.get(`settings.${C.SETTING.SHOW_CUSTOM_HOST}`) !== false;
  }.property(`settings.${C.SETTING.SHOW_CUSTOM_HOST}`),

  showPicker: Ember.computed('model.availableDrivers.length','allowOther','hasOther','allowCustom', function() {
    return !this.get('projects.current.isWindows') && (
            this.get('model.availableDrivers.length') +
            (this.get('allowOther') && this.get('hasOther') ? 1 : 0) +
            (this.get('allowCustom') ? 1 : 0)
          ) > 1;
  }),

  showManage: Ember.computed('access.admin','projects.current.isWindows', function() {
    return !this.get('projects.current.isWindows') && this.get('access.admin');
  }),
});
