import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  tagName:    '',
  model:      null,
  expandAll:  null,
  expandFn:   null,
  sortBy:     'linkEndpoint',
  descending: true,
  headers:    [
    {
      name:           'linkEndpoint',
      sort:           ['linkEndpoint'],
      translationKey: 'appDetailPage.endpoints.endpoint',
      searchField:    'linkEndpoint',
    },
    {
      name:           'protocol',
      sort:           ['linkEndpoint', 'protocol'],
      translationKey: 'appDetailPage.endpoints.protocol',
      searchField:    'protocol',
    }
  ],
});
