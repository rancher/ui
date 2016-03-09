import Ember from 'ember';
import C from 'ui/utils/constants';
import FasterLinksAndMenus from 'ui/mixins/faster-links-and-menus';
import StrippedName from 'ui/mixins/stripped-name';

export default Ember.Component.extend(FasterLinksAndMenus, StrippedName, {
  model: null,
  children: null,
  groupHasChildren: false,

  classNames: ['subpod','instance'],
  classNameBindings: ['model.isManaged:managed'],

  stateBackground: function() {
    return this.get('model.stateColor').replace("text-","bg-");
  }.property('model.stateColor'),

  isKubernetes: function() {
    return !!this.get('model.labels')[C.LABEL.K8S_POD_NAME];
  }.property('model.labels'),
});
