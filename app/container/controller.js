import Ember from 'ember';
import CattleTransitioningController from 'ui/mixins/cattle-transitioning-controller';

export default Ember.Controller.extend(CattleTransitioningController, {
  needs: ['application'],
  state: Ember.computed.alias('model.combinedState'),

  mountError: null,
  relatedVolumes: null,
  ports: null,
});
