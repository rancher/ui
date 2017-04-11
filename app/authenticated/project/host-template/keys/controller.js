import Ember from 'ember';

const PROVIDERS = [
  {
    id:             'Amazon',
    translationKey: 'hostTemplatesPage.keys.dropdownAdd.amazon'
  },
  {
    id:             'Digital Ocean',
    translationKey: 'hostTemplatesPage.keys.dropdownAdd.do'
  },
  {
    id:             'Packet',
    translationKey: 'hostTemplatesPage.keys.dropdownAdd.packet'
  },
]

export default Ember.Controller.extend({
  modalService: Ember.inject.service('modal'),
  providers:    PROVIDERS,
  sortBy:       'flavorPrefix',
  actions: {
    newTemplateKey(id) {
      this.get('modalService').toggleModal('modal-add-host-template', {
        provider: id,
        hostKeys: this.get('model'),
      });
    }
  },
  headers: [
    {
      name:           'state',
      translationKey: 'hostTemplatesPage.table.state',
      sort:           ['state','flavorPrefix',  'name', 'created'],
      width:          '100'
    },
    {
      name:           'flavorPrefix',
      translationKey: 'hostTemplatesPage.table.flavor',
      sort:           ['flavorPrefix', 'state', 'name', 'created'],
      width:          '150'
    },
    {
      name:           'name',
      translationKey: 'hostTemplatesPage.table.name',
      sort:           ['name','flavorPrefix',  'state', 'created'],
      width:          ''
    },
    {
      name:           'description',
      translationKey: 'hostTemplatesPage.table.desc',
      sort:           ['state','flavorPrefix',  'name', 'created'],
      width:          ''
    },
    {
      name:           'publicValues',
      translationKey: 'hostTemplatesPage.table.public',
      sort:           ['publicValues','flavorPrefix',  'name', 'created'],
      width:          ''
    },
    {
      name:           'created',
      translationKey: 'hostTemplatesPage.table.created',
      sort:           ['created','flavorPrefix',  'name', 'state'],
      width:          '150'
    },
  ],
});
