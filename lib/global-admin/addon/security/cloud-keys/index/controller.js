import Controller from '@ember/controller';
import { computed, get } from '@ember/object';
import { inject as service } from '@ember/service';
import layout from './template';

const HEADERS = [
  {
    name:           'type',
    sort:           ['displayType'],
    searchField:    'displayType',
    translationKey: 'generic.type',
    type:           'string',
  },
  {
    name:           'name',
    sort:           ['displayName'],
    searchField:    'displayName',
    translationKey: 'generic.name',
    type:           'string',
  },
  {
    classNames:     'text-right pr-20',
    name:           'created',
    sort:           ['created'],
    translationKey: 'generic.created',
  },
];

export default Controller.extend({
  modal: service(),

  layout,
  sortBy:           'created',
  searchText:       '',
  headers:          HEADERS,

  actions: {
    addCloudKey() {
      this.modal.toggleModal('modal-add-cloud-key');
    }
  },

  filteredContent: computed('model.@each.{id}', function() {
    return get(this, 'model').sortBy('id');
  }),
});
