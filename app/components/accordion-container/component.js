import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  model:         null,
  expandOnInit:  true,
  sortBy:        'displayState',
  descending:    true,
  initExpand:    true,
  headers:       [
    {
      name:           'displayState',
      sort:           ['displayState'],
      translationKey: 'generic.state',
      width:          120
    },
    {
      name:           'name',
      sort:           ['name'],
      translationKey: 'generic.name',
    },
    {
      name:           'image',
      sort:           ['image'],
      translationKey: 'generic.image',
    },
    {
      name:           'restarts',
      sort:           ['restarts'],
      translationKey: 'generic.restarts',
      width:          100
    },
  ],
});
