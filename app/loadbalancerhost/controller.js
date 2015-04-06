import HostController from 'ui/host/controller';

export default HostController.extend({
  needs: ['loadbalancer'],

  actions: {
    delete: function() {
      this.delete();
    }
  },

  delete: function() {
    return this.controllerFor('loadbalancer').doAction('removehost',{
      hostId: this.get('id'),
    });
  },

  availableActions: function() {
    var choices = [
      { label: 'Remove Host',        icon: 'ss-trash',     action: 'promptDelete',        enabled: true, altAction: 'delete' },
    ];

    return choices;
  }.property('actions.{remove,purge}'),
});
