import Cattle from 'ui/utils/cattle';

var ContainerController = Cattle.TransitioningResourceController.extend({
  needs: ['hosts'],
  icon: 'fa-tint',

  actions: {
    restart: function() {
      return this.doAction('restart');
    },

    start: function() {
      return this.doAction('start');
    },

    stop: function() {
      return this.doAction('stop');
    },

    delete: function() {
      return this.delete();
    },

    restore: function() {
      return this.doAction('restore');
    },

    purge: function() {
      return this.doAction('purge');
    },

    shell: function() {
      this.transitionToRoute('container.shell', this.get('model'));
    },

    edit: function() {
      this.transitionToRoute('container.edit', this.get('model'));
    },

    promptDelete: function() {
      this.transitionToRoute('container.delete', this.get('model'));
    },
  },

  isOn: function() {
    return ['running','updating-running','migrating','restarting'].indexOf(this.get('state')) >= 0;
  }.property('state'),

  displayIp: function() {
    return this.get('primaryAssociatedIpAddress') || this.get('primaryIpAddress');
  }.property('primaryIpAddress','primaryAssociatedIpAddress'),

  canDelete: function() {
    return ['removed','removing','purging','purged'].indexOf(this.get('state')) === -1;
  }.property('state')
});

ContainerController.reopenClass({
  stateMap: {
   'running': {icon: 'fa-circle-o', color: 'text-info'},
   'stopped': {icon: 'fa-circle',   color: 'text-danger'},
   'removed': {icon: 'fa-trash',    color: 'text-danger'},
   'purged':  {icon: 'fa-fire',     color: 'text-danger'}
  },
});

export default ContainerController;
