import Ember from 'ember';
import C from 'ui/utils/constants';
import FasterLinksAndMenus from 'ui/mixins/faster-links-and-menus';

export default Ember.Component.extend(FasterLinksAndMenus, {
  model: null,
  children: null,
  groupHasChildren: false,
  stripProject: false,

  classNames: ['subpod','instance'],
  classNameBindings: ['model.isManaged:managed'],

  prefixLength: function() {
    var name = this.get('model.displayName');
    var stackName = (this.get('model.labels')||{})[C.LABEL.STACK_NAME];
    if ( stackName && name.indexOf(stackName) === 0 )
    {
      return stackName.length + 1;
    }

    return 0;
  }.property('name'),

  showEllipsis: Ember.computed.and('stripProject','prefixLength'),

  displayName: function() {
    var name = this.get('model.displayName');
    if ( this.get('stripProject') )
    {
      var len = this.get('prefixLength');
      return name.substr(len);
    }
    else
    {
      return name;
    }
  }.property('stripProject','prefixLength','model.displayName'),

  stateBackground: function() {
    return this.get('model.stateColor').replace("text-","bg-");
  }.property('model.stateColor'),

  isKubernetes: function() {
    return !!this.get('model.labels')[C.LABEL.K8S_POD_NAME];
  }.property('model.labels'),
});
