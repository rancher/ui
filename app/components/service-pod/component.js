import Ember from 'ember';
import ReadLabels from 'ui/mixins/read-labels';
import FasterLinksAndMenus from 'ui/mixins/faster-links-and-menus';
import GroupedInstances from 'ui/mixins/grouped-instances';
import C from 'ui/utils/constants';

export default Ember.Component.extend(ReadLabels, FasterLinksAndMenus, GroupedInstances, {
  model: null,
  mode: null,

  labelResource: Ember.computed.alias('model.launchConfig'),
  classNames: ['pod','service'],
  classNameBindings: ['stateBorder'],

  actions: {
    scaleUp: function() {
      this.get('model').send('scaleUp');
    }
  },

  isActive: function() {
    return ['active','degraded','updating-active'].indexOf(this.get('model.state')) >= 0;
  }.property('model.state'),

  isInactive: Ember.computed.equal('model.state','inactive'),

  arrangedInstances: function() {
    return (this.get('model.instances')||[]).sortBy('name','id');
  }.property('model.instances.@each.{name,id}'),

  hasChildren: function() {
    return this.get('groupedInstances').filterBy('hasChildren',true).get('length') > 0;
  }.property('groupedInstances.@each.hasChildren'),

  showScaleUp: function() {
    if ( this.get('isActive') && this.get('model.hasContainers') && this.get('model.canScale') )
    {
      return this.getLabel(C.LABEL.SCHED_GLOBAL) === null;
    }
    else
    {
      return false;
    }
  }.property('isActive','hasBody','model.labels'),

  stateBackground: function() {
    return this.get('model.stateColor').replace("text-","bg-");
  }.property('model.stateColor'),

  stateBorder: function() {
    return this.get('model.stateColor').replace("text-","border-top-");
  }.property('model.stateColor'),

  iconColor: function() {
    var color = this.get('model.stateColor');
    if ( color.indexOf('danger') >= 0 || color.indexOf('warning') >= 0 )
    {
      return color;
    }
  }.property('model.stateColor'),

  iconLabel: function() {
    switch ( this.get('model.type').toLowerCase() ) {
      case 'kubernetesreplicationcontroller': return 'Controller';
      case 'kubernetesservice': return 'Service';
      default: return '';
    }
  }.property('model.type'),

});
