import Ember from 'ember';

export default Ember.Service.extend({
  all: null,

  init() {
    this._super();
    this.set('all', this.get('store').allUnremoved('activesetting'));
  },

  unknownProperty(key) {
    return this.get('asMap')[key];
  },

  asMap: function() {
    var out = {};
    (this.get('all')||[]).forEach((setting) => {
      var name = setting.get('name').replace(/\./g,'_').toLowerCase();
      out[name] = setting.get('value');
    });

    return out;
  }.property('all.@each.{name,value}'),

  uiVersion: function() {
    return 'v' + this.get('app.version');
  }.property('app.version'),

  rancherVersion: Ember.computed.alias('asMap.rancher_server_image'),
  composeVersion: Ember.computed.alias('asMap.rancher_compose_version'),
  cattleVersion: Ember.computed.alias('asMap.cattle_version'),
  dockerMachineVersion: Ember.computed.alias('asMap.docker_machine_version'),
  goMachineVersion: Ember.computed.alias('asMap.go_machine_service_version'),
});
