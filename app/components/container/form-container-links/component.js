import Ember from 'ember';
import ContainerChoices from 'ui/mixins/container-choices';
import { STATUS, STATUS_INTL_KEY, classForStatus } from 'ui/components/accordion-list-item/component';

export default Ember.Component.extend(ContainerChoices, {
  // Inputs
  editing: null,
  instance: null,
  allHosts: null,
  initialLinks: null,
  linksArray: null,

  tagName: '',
  errors: null,

  actions: {
    addLink: function() {
      this.get('linksArray').pushObject({name: '', targetInstanceId: null});
    },
    removeLink: function(obj) {
      this.get('linksArray').removeObject(obj);
    },
  },

  init() {
    this._super(...arguments);
    var out = [];
    var links = this.get('initialLinks')||[];

    if ( Ember.isArray(links) )
    {
      links.forEach(function(value) {
        // Objects, from edit
        if ( typeof value === 'object' )
        {
          out.push({
            existing: (value.id ? true : false),
            obj: value,
            name: value.linkName || value.name,
            targetInstanceId: value.targetInstanceId,
          });
        }
        else
        {
          // Strings, from create maybe
          var match = value.match(/^([^:]+):(.*)$/);
          if ( match )
          {
            out.push({name: match[1], targetInstanceId: match[2], existing: false});
          }
        }
      });
    }

    this.set('linksArray', out);

    Ember.run.scheduleOnce('afterRender', () => {
      this.linksDidChange();
    });
  },

  linksDidChange: function() {
    var errors = [];
    var linksAsMap = {};

    this.get('linksArray').forEach((row) => {
      if ( row.targetInstanceId )
      {
        var name = row.name;
        // Lookup the container name if an "as name" wasn't given
        if ( !name )
        {
          var container = this.get('store').getById('container', row.targetInstanceId);
          if ( container )
          {
            name = container.name;
          }
        }

        if ( name )
        {
          linksAsMap[ name ] = row.targetInstanceId;
        }
        else
        {
          errors.push('Link to container ' + row.targetInstanceId + '  must have an "as name".');
        }
      }
    });

    this.set('instance.instanceLinks', linksAsMap);
    this.set('errors', errors);
    this.sendAction('changed', this.get('linksArray'));
  }.observes('linksArray.@each.{targetInstanceId,name}'),

  statusClass: null,
  status: function() {
    let k = STATUS.NONE;
    let count = (this.get('linksArray')||[]).filterBy('targetInstanceId').get('length') || 0;

    if ( count ) {
      if ( this.get('errors.length') ) {
        k = STATUS.INCOMPLETE;
      } else {
        k = STATUS.CONFIGURED;
      }
    }

    this.set('statusClass', classForStatus(k));
    return this.get('intl').t(`${STATUS_INTL_KEY}.${k}`, {count: count});
  }.property('userLabelArray.@each.key'),
});
