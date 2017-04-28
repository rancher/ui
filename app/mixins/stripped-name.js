import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Mixin.create({
  stripStack: true,
  prefixLength: function() {
    var name = this.get('model.displayName');
    var stackName = (this.get('model.labels')||{})[C.LABEL.STACK_NAME];
    if ( stackName && name.indexOf(stackName) === 0 )
    {
      return stackName.length + 1;
    }

    return 0;
  }.property('name'),
  showEllipsis: Ember.computed.and('stripStack','prefixLength'),

  displayName: function() {
    var name = this.get('model.displayName')||'';
    if ( this.get('stripStack') )
    {
      var len = this.get('prefixLength');
      return name.substr(len);
    }
    else
    {
      return name;
    }
  }.property('stripStack','prefixLength','model.displayName'),
});
