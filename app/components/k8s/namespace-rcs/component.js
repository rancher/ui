import Ember from 'ember';
import FilterState from 'ui/mixins/filter-state';

export default Ember.Component.extend(FilterState, {
  model: null,
  single: false,
  classNames: ['stack-section'],

  filtered: function() {
    return (this.get('model.services')||[]).filter((row) => {
      return row.get('kind').toLowerCase() === 'kubernetesreplicationcontroller' &&
        (['removing','removed','purging','purged'].indexOf(row.get('state')) === -1);
    });
  }.property('model.services.@each.{kind,state}'),
});
