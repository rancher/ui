import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  model: null,
  children: null,
  groupHasChildren: false,
  stripProject: false,

  classNames: ['subpod','instance','resource-action-hover'],
  classNameBindings: ['model.isManaged:managed','groupHasChildren:subpod-full-width:subpod-half-width'],

  prefixLength: function() {
    var name = this.get('model.displayName');
    var projectName = (this.get('model.labels')||{})[C.LABEL.PROJECT_NAME];
    if ( projectName && name.indexOf(projectName) === 0 )
    {
      return projectName.length + 1;
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

  click: function() {
    // For touch devices, show actions on a click anywhere in the component
    if ( $('BODY').hasClass('touch') )
    {
      this.send('showActions');
    }
  },

  stateBackground: function() {
    return this.get('model.stateColor').replace("text-","bg-");
  }.property('model.stateColor'),
});
