import Resource from 'ember-api-store/models/resource';
import CattleTransitioningResource from 'ui/mixins/cattle-transitioning-resource';

export function initialize(/* container, application */) {
  Resource.reopen(CattleTransitioningResource);
  Resource.reopenClass({
    pollTransitioningDelay: 30000,
    pollTransitioningInterval: 30000,
    defaultStateIcon: 'fa fa-question',
    defaultStateColor: 'text-primary',
  });
}

export default {
  name: 'extend-resource',
  initialize: initialize
};

