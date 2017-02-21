import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Controller.extend({
  bulkActionHandler: Ember.inject.service(),
  bulkActionsList: C.BULK_ACTIONS,
  sortBy: 'name',
  prefs: Ember.inject.service(),

  queryParams: ['sortBy'],

  showSystem: Ember.computed(`prefs.${C.PREFS.SHOW_SYSTEM}`, {
    get() {
      return this.get(`prefs.${C.PREFS.SHOW_SYSTEM}`) !== false;
    },

    set(key, value) {
      this.set(`prefs.${C.PREFS.SHOW_SYSTEM}`, value);
      return value;
    }
  }),

  show: Ember.computed('showSystem', function() {
    return this.get('showSystem') === false ? 'standard' : 'all';
  }),

  actions: {
    applyBulkAction: function(name, selectedElements) {
      if ( selectedElements.length === 1 ) {
        selectedElements.objectAt(0).send(name);
      } else {
        this.get('bulkActionHandler')[name](selectedElements);
      }
    },
  },

  headers: [
    {
      classNames: '',
      name: 'stateSort',
      searchField: 'displayState',
      sort: ['stateSort','name','id'],
      translationKey: 'containersPage.index.table.header.state',
      width: '125px'
    },
    {
      name: 'name',
      sort: ['name','id'],
      translationKey: 'containersPage.index.table.header.name',
    },
    {
      name: 'displayIp',
      sort: ['displayIp','name','id'],
      width: '110px',
      translationKey: 'containersPage.index.table.header.ip',
    },
    {
      name: 'primaryHost.displayName',
      sort: ['primaryHost.displayName','name','id'],
      translationKey: 'containersPage.index.table.header.host',
    },
    {
      name: 'imageUuid',
      sort: ['imageUuid','id'],
      translationKey: 'containersPage.index.table.header.image',
    },
    {
      name: 'command',
      sort: ['command','name','id'],
      translationKey: 'containersPage.index.table.header.command',
    },
    {
      isActions: true,
      width: '110px',
    },
  ],

  // showChanged should be an observer rather then init to correctly set the showSystem checkbox
  // if showSystem is set on init show does not contain the correct qp as the router has not set it
  // so the checkbox never gets set
  showChanged: function() {
    this.set('showSystem', this.get('show') === 'all');
  }.observes('show'),

  showSystemChanged: function() {
    this.set('show', (this.get('showSystem') ? 'all' : 'standard'));
  }.observes('showSystem'),

  filtered: function() {
    let all = this.get('model');
    if ( this.get('showSystem') ) {
      return all;
    } else {
      return all.filterBy('isSystem', false);
    }
  }.property('model.@each.system','showSystem'),

});
