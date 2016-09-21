import Ember from 'ember';
import Sortable from 'ui/mixins/sortable';
import C from 'ui/utils/constants';
import { tagsToArray, normalizedChoices } from 'ui/models/stack';

export default Ember.Controller.extend(Sortable, {
  stacks: Ember.inject.controller(),
  projects: Ember.inject.service(),
  prefs: Ember.inject.service(),
  intl: Ember.inject.service(),

  which: Ember.computed.alias('stacks.which'),
  tags: Ember.computed.alias('stacks.tags'),
  showAddtlInfo: false,
  selectedService: null,

  tagsArray: null,
  tagChoices: function() {
    let out = normalizedChoices(this.get('model'));
    tagsToArray(this.get('tags')).forEach((tag) => {
      out.addObject(tag);
    });

    return out.sort((a,b) => {
      return a.toLowerCase().localeCompare(b.toLowerCase());
    });
  }.property('model.@each.group'),

  actions: {
    showAddtlInfo(service) {
      this.set('selectedService', service);
      this.set('showAddtlInfo', true);
    },

    dismiss() {
      this.set('showAddtlInfo', false);
      this.set('selectedService', null);
    },

    sortResults(name) {
      this.get('prefs').set(C.PREFS.SORT_STACKS_BY, name);
      this.send('setSort', name);
    },

    updateTags(select) {
      let options = Array.prototype.slice.call(select.target.options, 0);
      let selected = options.filterBy('selected',true).map(opt => opt.value);

      if ( selected.length === 0 )
      {
        this.set('tags','');
      }
      else
      {
        this.set('tags', selected.join(','));
      }
    },
  },

  setup: function() {
    // Need this to setup the observer for filteredStacks
    this.get('which');

    var sort = this.get(`prefs.${C.PREFS.SORT_STACKS_BY}`);
    if (sort && sort !== this.get('sortBy')) {
      this.set('sortBy', sort);
    }

    this.set('tagsArray', tagsToArray(this.get('tags')));

    Ember.run.schedule('afterRender', this, () => {
      var opts = {
        maxHeight: 200,
        buttonClass: 'btn btn-sm btn-default',

        templates: {
          li: '<li><a tabindex="0"><label></label></a></li>',
        },

        buttonText: function(options, select) {
          if ( options.length === 0 ) {
            return 'Filter Tags';
          }
          else if ( $('option',select).length === options.length)
          {
            return 'All Tags';
          }
          else if ( options.length === 1 )
          {
            return "Tag: " +$(options[0]).text();
          }
          else
          {
            return options.length + ' Tags';
          }
        },
      };

      Ember.$('.stack-tags').multiselect(opts);
    });
  }.on('init'),

  filteredStacks: function() {
    var which = this.get('which');
    var needTags = tagsToArray(this.get('tags'));
    var out = this.get('model');

    if ( which === C.EXTERNAL_ID.KIND_NOT_KUBERNETES )
    {
      out = out.filter((obj) => obj.get('grouping') !== C.EXTERNAL_ID.KIND_KUBERNETES);
    }
    else if ( which === C.EXTERNAL_ID.KIND_NOT_SWARM )
    {
      out = out.filter((obj) => obj.get('grouping') !== C.EXTERNAL_ID.KIND_SWARM);
    }
    else if ( which === C.EXTERNAL_ID.KIND_NOT_MESOS )
    {
      out = out.filter((obj) => obj.get('grouping') !== C.EXTERNAL_ID.KIND_MESOS);
    }
    else if ( which !== C.EXTERNAL_ID.KIND_ALL )
    {
      out = out.filterBy('grouping', which);
    }

    if ( needTags.length ) {
      out = out.filter((obj) => obj.hasTags(needTags));
    }

    return out;

  // stateSort isn't really a dependency here, but sortable won't recompute when it changes otherwise
  }.property('model.[]','model.@each.{stateSort,grouping}','which','tags'),

  sortableContent: Ember.computed.alias('filteredStacks'),
  sortBy: 'name',
  sorts: {
    state: ['stateSort','name','id'],
    name: ['name','id']
  },

  pageHeader: function() {
    let which = this.get('which');
    if ( which === C.EXTERNAL_ID.KIND_ALL ) {
      return 'stacksPage.header.all';
    } else if ( C.EXTERNAL_ID.SHOW_AS_SYSTEM.indexOf(which) >= 0 ) {
      return 'stacksPage.header.system';
    } else if ( which.toLowerCase() === 'user') {
      return 'stacksPage.header.user';
    } else {
      return 'stacksPage.header.custom';
    }
  }.property('which'),
});
