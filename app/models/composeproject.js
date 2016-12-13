import Stack from 'ui/models/stack';

export default Stack.extend({
  type: 'composeProject',
  grouping: 'swarm',

  availableActions: function() {
    var a = this.get('actionLinks');

    var out = [
      { label   : 'action.remove',     icon : 'icon icon-trash',          action : 'promptDelete',  enabled  : !!a.remove, altAction : 'delete'},
      { label   : 'action.viewInApi',  icon : 'icon icon-external-link',  action : 'goToApi',       enabled  : true },
    ];

    return out;
  }.property('actionLinks.{remove}'),

});
