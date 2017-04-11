import Resource from 'ember-api-store/models/resource';

var HostTemplate = Resource.extend({
  type: 'hosttemplate',
  actions: {
    deactivate: function() {
      return this.doAction('deactivate');
    },

    activate: function() {
      return this.doAction('activate');
    },
  },

  availableActions: function() {
    var a = this.get('actionLinks');

    return [
      { label: 'action.remove',        icon: 'icon icon-trash',  action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
    ];
  }.property('actionLinks.{remove}'),
});

export default HostTemplate;
