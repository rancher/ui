import Resource from 'ember-api-store/models/resource';
import CattleTransitioningResource from 'ui/mixins/cattle-transitioning-resource';

export function initialize(/* application */) {
  Resource.reopen(CattleTransitioningResource);
  Resource.reopenClass({
    defaultStateIcon:  'icon icon-help',
    defaultStateColor: 'text-primary',
    defaultSortBy:     'name',
  });
}

export default {
  name: 'extend-resource',
  initialize
};

