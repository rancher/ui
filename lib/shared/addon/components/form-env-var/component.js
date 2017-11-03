import Ember from 'ember';

export default Ember.Component.extend({
  tagName:    '',
  model:      null,
  expandAll:  null,
  expandFn:   null,
  sortBy:     'key',
  descending: true,
  headers:    [
    {
      name:           'key',
      sort:           ['key'],
      translationKey: 'formEnvVar.labels.key',
      searchField:    'key',
      width:          '350',
    },
    {
      name:           'value',
      sort:           ['value','key'],
      searchField:    'value',
      translationKey: 'formEnvVar.labels.value',
    },
  ],
});
