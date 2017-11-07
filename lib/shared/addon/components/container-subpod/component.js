import Component from '@ember/component';
import C from 'ui/utils/constants';
import StrippedName from 'shared/mixins/stripped-name';
import layout from './template';

export default Component.extend(StrippedName, {
  layout,
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
