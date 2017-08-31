import Resource from 'ember-api-store/models/resource';

var HostTemplate = Resource.extend({
  type: 'hosttemplate',
  actions: {
  },

  availableActions: function() {
    let l = this.get('links');

    return [
      { label: 'action.remove',     icon: 'icon icon-trash',  action: 'promptDelete', enabled: !!l.remove, altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',action: 'goToApi', enabled: true},
    ];
  }.property('links.{remove}'),
});

export default HostTemplate;
