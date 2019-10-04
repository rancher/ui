import { isArray } from '@ember/array';
import { set, computed, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

const CUSTOM = '__CUSTOM__';

export default Component.extend({
  allWorkloads: service(),
  intl:         service(),

  layout,
  stack:      null, // The default stack
  value:      null, // The [stack/]service string value
  exclude:    null,  // ID or array of IDs to exclude from list
  inputClass: 'form-control',

  obj:    null,    // The selected service object
  custom: false,

  init() {
    this._super(...arguments);

    let value = this.get('value');

    if ( value ) {
      let obj = this.get('allWorkloads').matching(value, this.get('stack'));

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

  valueChanged: observer('value', function() {
    let value = this.get('value');

    if ( value === CUSTOM ) {
      this.setProperties({
        value:  '',
        custom: true,
        obj:    null,
      });
    } else if ( value ) {
      let obj = this.get('allWorkloads').matching(value, this.get('stack'));

      this.set('obj', obj);
    }
  }),
  list: computed('grouped.[]', 'intl.locale', 'exclude', 'stack.name', function() {
    let stackId = this.get('stack.id');
    let list = this.get('allWorkloads.list').sortBy('combined');

    list.forEach((item) => {
      if ( item.obj.stackId === stackId ) {
        set(item, 'value', item.name);
      } else {
        set(item, 'value', item.combined);
      }
    });

    list.push({
      group: null,
      value: CUSTOM,
      name:  this.get('intl').t('schema.inputService.custom')
    });

    let exclude = this.get('exclude') || [];

    if ( !isArray(exclude) ) {
      exclude = [exclude];
    }
    if ( exclude.get('length') ) {
      list = list.filter((row) => !exclude.includes(row.id));
    }

    return list;
  }),

});
