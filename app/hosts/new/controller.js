import Ember from 'ember';

export default Ember.Controller.extend({
  access: Ember.inject.service(),
  projects: Ember.inject.service(),

  queryParams : ['backTo', 'driver', 'hostId'],
  backTo      : null,
  driver      : null,
  hostId      : null,

  allowCustom : true,
  allowOther  : true,

  actions: {
    switchDriver(name) {
      if (this.get('hostId')) {
        this.set('hostId', null);
        this.set('model.clonedModel', null);
      }
      this.set('driver', name);
    },
  },

  driverObj: function() {
    return this.get('model.availableDrivers').filterBy('name', this.get('driver'))[0];
  }.property('driver'),

  hasOther: function() {
    return this.get('model.availableDrivers').filterBy('hasUi',false).length > 0;
  }.property('model.availableDrivers.@each.hasUi'),

  showPicker: function() {
    return !this.get('projects.current.isWindows') && (
            this.get('model.availableDrivers.length') +
            (this.get('allowOther') && this.get('hasOther') ? 1 : 0) +
            (this.get('allowCustom') ? 1 : 0)
          ) > 1;
  }.property('model.availableDrivers.length','allowOther','hasOther','allowCustom'),

  showManage: function() {
    return !this.get('projects.current.isWindows') && this.get('access.admin');
  }.property('access.admin','projects.current.isWindows'),

  sortedDrivers: Ember.computed.sort('model.availableDrivers','sortBy'),
  sortBy: ['name'],
});
