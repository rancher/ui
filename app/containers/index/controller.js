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

  // @@TODO - need to fix prop names here, i feel like they shouldnt have to matcht the primary sort in the array
  sorts: {
    stateSort:    ['stateSort','name','id'],
    name:     ['name','id'],
    displayIp:       ['displayIp','name','id'],
    imageUuid:    ['imageUuid','id'],
    command:  ['command','name','id'],
    "primaryHost.displayName":     ['primaryHost.displayName','name','id'],
  },

  actions: {
    parseBulkActions: function(name, selectedElements) {
      this.get('bulkActionHandler')[name](selectedElements);
    },
  },

  headers: [
    {
      displayName: 'State',
      name: 'stateSort',
      searchField: 'displayState',
      type: 'string',
      classNames: '',
      width: '125px'
    },
    {
      displayName: 'Name',
      name: 'name',
      type: 'string',
    },
    {
      displayName: 'IP',
      name: 'displayIp',
      type: 'string',
      width: '110px',
    },
    {
      displayName: 'Host',
      name: 'primaryHost.displayName',
      type: 'string',
    },
    {
      displayName: 'Image',
      name: 'imageUuid',
      type: 'string',
    },
    {
      displayName: 'Command',
      name: 'command',
      type: 'string',
    },
  ],
  tableCount: Ember.computed(function() {
    return this.get(`session.${C.PREFS.TABLE_COUNT}`) ? this.get(`session.${C.PREFS.TABLE_COUNT}`) : C.TABLES.DEFAULT_COUNT;
  }),


  // showChanged should be an observer rather then init to correctly set the showSystem checkbox
  // if showSystem is set on init show does not contain the correct qp as the router has not set it
  // so the checkbox never gets set
  showChanged: function() {
    this.set('showSystem', this.get('show') === 'all');
  }.observes('show'),

  showSystemChanged: function() {
    this.set('show', (this.get('showSystem') ? 'all' : 'standard'));
  }.observes('showSystem'),

  sortableContent: Ember.computed.alias('filtered'),
  filtered: function() {
    let all = this.get('model');
    if ( this.get('showSystem') ) {
      return all;
    } else {
      return all.filterBy('isSystem', false);
    }
  }.property('model.@each.system','showSystem'),

});
