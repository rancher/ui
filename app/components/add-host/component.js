import Ember from 'ember';

export default Ember.Component.extend({
  access:        Ember.inject.service(),
  projects:      Ember.inject.service(),
  hostService: Ember.inject.service('host'),
  driver:        null,
  hostId:        null,
  allowCustom:   true,
  allowOther:    true,
  forCatalog:    true,
  inModal:       false,
  goBack:        null,

  sortBy:        ['name'],
  sortedDrivers: Ember.computed.sort('model.availableDrivers','sortBy'),

  didReceiveAttrs() {
    if (!this.get('driver')) {
      if (this.get('inModal')) {
        this.set('driver', this.get('sortedDrivers.firstObject.name'));
      } else {
        this.set('driver', this.get('hostService.defaultDriver'));
      }
    }
  },

  actions: {
    switchDriver(name) {
      if (this.get('hostId')) {
        this.set('hostId', null);
        this.set('model.clonedModel', null);
      }
      this.set('driver', name);
    },
  },

  driverObj: Ember.computed('driver', function() {
    return this.get('model.availableDrivers').filterBy('name', this.get('driver'))[0];
  }),

  hasOther: Ember.computed('model.availableDrivers.@each.hasUi', function() {
    return this.get('model.availableDrivers').filterBy('hasUi',false).length > 0;
  }),

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
