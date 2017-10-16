import Resource from 'ember-api-store/models/resource';

var AuditLog = Resource.extend({
  availableActions: function() {
    let choices = [
      { label: 'action.viewInApi',      icon: 'icon icon-external-link',    action: 'goToApi',        enabled: true },
    ];

    return choices;
  }.property(),
});

export default AuditLog;
