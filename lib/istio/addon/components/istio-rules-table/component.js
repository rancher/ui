import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';
import { get, computed } from '@ember/object';

export default Component.extend({
  scope: service(),

  layout,
  sortBy: 'created',

  headers: [
    {
      name:           'state',
      sort:           ['sortState', 'displayName'],
      searchField:    'displayState',
      translationKey: 'generic.state',
      width:          120
    },
    {
      name:           'name',
      sort:           ['displayName', 'id'],
      searchField:    'displayName',
      translationKey: 'generic.name',
    },
    {
      name:           'template',
      sort:           ['catalogTemplate.name', 'id'],
      searchField:    'catalogTemplate.name',
      translationKey: 'istio.table.template',
    },
    {
      name:           'host',
      sort:           ['answers.host', 'id'],
      searchField:    'answers.host',
      translationKey: 'istio.table.host',
    },
    {
      name:           'created',
      sort:           ['created', 'id'],
      classNames:     'text-right pr-20',
      searchField:    false,
      translationKey: 'generic.created',
    },
  ],

  apps: null,

  rows: computed('apps.@each.isIstio', function(){
    return (get(this, 'apps') || []).filterBy('isIstio', true);
  }),
});
