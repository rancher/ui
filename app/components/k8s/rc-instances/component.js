import Ember from 'ember';
import FasterLinksAndMenus from 'ui/mixins/faster-links-and-menus';
import FilterState from 'ui/mixins/filter-state';

export default Ember.Component.extend(FasterLinksAndMenus, FilterState, {
  projects: Ember.inject.service(),

  detailBaseUrl: function() {
    return `/env/${this.get('projects.current.id')}/infra/containers/`;
  }.property('projects.current.id'),

  model: null,
  single: false,
  classNames: ['stack-section'],

  filterableContent: Ember.computed.alias('model.instances'),
});
