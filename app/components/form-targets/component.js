import Ember from 'ember';
import {stringifyTarget} from 'ui/utils/parse-target';

export default Ember.Component.extend({
  intl        : Ember.inject.service(),

  existing    : null,
  exclude     : null,
  isBalancer  : null,
  editing     : false,

  classNames  : ['inline-form'],

  actions: {
    addTargetService: function() {
      this.get('targetsArray').pushObject(Ember.Object.create({isService: true, value: null}));
    },
    removeTarget: function(obj) {
      this.get('targetsArray').removeObject(obj);
    },

    setAdvanced: function() {
      this.set('isAdvanced', true);
    },
  },

  isAdvanced: false,
  targetsArray: null,

  init() {
    this._super(...arguments);

    this.set('isAdvanced', this.get('editing'));

    var out = [];

    var existing = this.get('existing');
    if ( existing && existing.get('linkedServices'))
    {
      let links = existing.get('linkedServices');
      Object.keys(links).forEach((key) => {
        out.pushObject(Ember.Object.create({
          isService: true,
          value: links[key],
        }));
      });
    }
    else
    {
      out.pushObject(Ember.Object.create({
        isService: true,
        value: null
      }));
    }

    Ember.run.scheduleOnce('afterRender', () => {
      this.set('targetsArray', out);
      this.targetsChanged();
    });
  },

  targetResources: function() {
    var out = [];
    var array = this.get('targetsArray');
    array.filterBy('isService',true).filterBy('value').map((choice) => {
      var serviceId = Ember.get(choice,'value');

      var entry = out.filterBy('serviceId', serviceId)[0];
      if ( !entry )
      {
        entry = Ember.Object.create({
          serviceId: serviceId,
          ports: [],
        });
        out.pushObject(entry);
      }

      var str = stringifyTarget(choice);
      if ( str )
      {
        entry.get('ports').pushObject(str);
      }
    });

    return out;
  }.property('targetsArray.@each.{isService,value,hostname,path,srcPort,dstPort}'),

  targetsChanged: function() {
    this.sendAction('changed', this.get('targetsArray'), this.get('targetResources'));
  }.observes('targetResources','targetResources.@each.{serviceId,ports}'),

  hasAdvancedSourcePorts: function() {
    return this.get('targetsArray').filterBy('isService',true).filter((target) => {
      return parseInt(target.get('srcPort'),10) > 0;
    }).get('length') > 0;
  }.property('targetsArray.@each.{isService,srcPort}'),
});
