import Ember from 'ember';
import ReadLabels from 'ui/mixins/read-labels';
import C from 'ui/utils/constants';

export default Ember.Component.extend(ReadLabels, {
  model: null,
  labelResource: Ember.computed.alias('model.launchConfig'),
  classNames: ['pod','service','resource-action-hover'],
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

  hasContainers: function() {
    return ['service','loadbalancerservice'].indexOf(this.get('model.type').toLowerCase()) !== -1;
  }.property('model.type'),

  showScaleUp: function() {
    if ( this.get('isActive') && this.get('hasContainers') )
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
    if ( color.indexOf('danger') >= 0 )
    {
      return color;
    }
  }.property('model.stateColor'),
});
