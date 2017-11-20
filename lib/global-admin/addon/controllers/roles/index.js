import Controller from '@ember/controller';
import FilterState from 'ui/mixins/filter-state';

const headers = []

export default Controller.extend(FilterState, {
  headers: headers,
});
