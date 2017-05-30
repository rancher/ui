import Resource from 'ember-api-store/models/resource';

var HostTemplate = Resource.extend({
  type: 'hosttemplate',
  actions: {
  },

  availableActions: function() {
    var a = this.get('actionLinks');

    return [
      { label: 'action.remove',        icon: 'icon icon-trash',  action: 'promptDelete', enabled: !!a.remove, altAction: 'delete' },
    ];
  }.property('actionLinks.{remove}'),
});

export default HostTemplate;
