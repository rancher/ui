import Ember from 'ember';

const CUSTOM = '__CUSTOM__';

export default Ember.Component.extend({
  allServices : Ember.inject.service(),
  intl: Ember.inject.service(),

  stack: null, // The default stack
  value: null, // The [stack/]service string value
  exclude: null,  // ID or array of IDs to exclude from list
  inputClass: 'form-control',

  obj: null,    // The selected service object
  custom: false,

  init() {
    this._super(...arguments);

    let value = this.get('value');
    if ( value ) {
      let obj = this.get('allServices').matching(value, this.get('stack'));
      if ( obj ) {
        this.setProperties({
          obj,
          custom: false,
        });
      } else {
        this.set('custom', true);
      }
    }
  },

  actions: {
    standard() {
      if ( !this.get('obj') ) {
        this.set('value', null);
      }

      this.set('custom', false);
    },
  },

  list: function() {
    let stackId = this.get('stack.id');
    let list = this.get('allServices.list').sortBy('combined');

    list.forEach((item) => {
      if ( item.obj.stackId === stackId ) {
        Ember.set(item,'value',item.name);
      } else {
        Ember.set(item,'value',item.combined);
      }
    });

    list.push({group: null, value: CUSTOM, name: this.get('intl').t('schema.inputService.custom')});

    let exclude = this.get('exclude')||[];
    if ( !Ember.isArray(exclude) ) {
      exclude = [exclude];
    }
    if ( exclude.get('length') ) {
      list = list.filter((row) => !exclude.includes(row.id));
    }

    return list;
  }.property('grouped.[]','intl.locale','exclude','stack.name'),

  valueChanged: function() {
    let value = this.get('value');
    if ( value === CUSTOM ) {
      this.setProperties({
        value: '',
        custom: true,
        obj: null,
      });
    } else if ( value ) {
      let obj = this.get('allServices').matching(value, this.get('stack'));
      this.set('obj', obj);
    }
  }.observes('value'),
});
