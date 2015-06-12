import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  model: null,
  stripProject: false,

  classNames: ['subpod','instance','resource-action-hover'],
  classNameBindings: ['model.isManaged:managed'],

  displayName: function() {
    var name = this.get('model.displayName');

    if ( this.get('stripProject') )
    {
      var projectName = (this.get('model.labels')||{})[C.LABEL.PROJECT_NAME];
      if ( projectName && name.indexOf(projectName) === 0 )
      {
        name = new Ember.Handlebars.SafeString('&hellip;' + Ember.Handlebars.Utils.escapeExpression(name.substr(projectName.length + 1)));
      }
    }

    return name;
  }.property('stripProject','model.displayName'),

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
