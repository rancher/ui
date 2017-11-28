import Component from '@ember/component';
import layout from './template';

const headers = [{
    name:           'name',
    sort:           ['name'],
    translationKey: 'projectsPage.table.header.project.label',
  },{
    name: 'created',
    sort: ['created'],
    translationKey: 'projectsPage.table.header.created.label',
    width: '200',
  },
];

export default Component.extend({
  layout,
  tagName: '',
  headers,
  sortBy: 'name',
});
