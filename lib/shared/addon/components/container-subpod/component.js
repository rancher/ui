import Ember from 'ember';
import C from 'ui/utils/constants';
import StrippedName from 'ui/mixins/stripped-name';

export default Ember.Component.extend(StrippedName, {
  model: null,
  children: null,
  groupHasChildren: false,

  classNames: ['subpod','instance'],

  stateBackground: function() {
    return 'bg-'+this.get('model.stateColor').substr(5);
  }.property('model.stateColor'),

  isKubernetes: function() {
    return !!this.get('model.labels')[C.LABEL.K8S_POD_NAME];
  }.property('model.labels'),
});
