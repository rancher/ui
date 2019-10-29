import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { get, computed } from '@ember/object';

const HEADERS = [
  {
    name:           'state',
    sort:           ['sortState', 'name', 'id'],
    translationKey: 'nodeTemplatesPage.table.state',
    width:          100,
  },
  {
    name:           'name',
    sort:           ['name', 'id'],
    translationKey: 'nodeTemplatesPage.table.name',
  },
  {
    name:           'owner',
    sort:           ['creator.displayName', 'name', 'id'],
    translationKey: 'nodeTemplatesPage.table.owner',
    width:          150,
  },
  {
    name:           'provider',
    sort:           ['displayProvider', 'name', 'id'],
    translationKey: 'nodeTemplatesPage.table.provider',
    width:          150,
  },
  {
    name:           'location',
    sort:           ['displayLocation', 'name', 'id'],
    translationKey: 'nodeTemplatesPage.table.location',
    width:          150,
  },
  {
    name:           'size',
    sort:           ['displaySize', 'name', 'id'],
    translationKey: 'nodeTemplatesPage.table.size',
    width:          150,
  },
];

export default Controller.extend({
  modalService:      service('modal'),
  sortBy:            'name',
  headers:           HEADERS,
  extraSearchFields: [
    'displayUserLabelStrings',
    'displayTaintsStrings'
  ],

  actions: {
    newTemplate() {
      get(this, 'modalService').toggleModal('modal-edit-node-template');
    },
  },

  filteredNodeTemplates: computed('model.nodeTemplates.@each.{id,name,state,displayLocation,displaySize}', function() {
    return get(this, 'model.nodeTemplates').filterBy('displayName');
  }),
});
