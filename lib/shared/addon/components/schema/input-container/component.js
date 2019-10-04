import { isArray } from '@ember/array';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import { computed, observer } from '@ember/object';

export default Component.extend({
  allContainers: service(),

  layout,
  selected:          null,  // Selected service ID
  exclude:           null,  // ID or array of IDs to exclude from list
  stack:             null,  // The current stack, to generate stack-relative names

  // For use as a catalog question
  field:   null,              // Read default from a schema resourceField
  value:   null,
  // stackName/serviceName string output

  init() {
    this._super(...arguments);

    let def = this.get('field.default');

    if ( def && !this.get('selected') ) {
      let match = this.get('allContainers.list').findBy('name', def);

      this.set('selected', match || null);
    }
  },

  selectedChanged: observer('selected', function() {
    let id = this.get('selected');
    let str = null;

    if ( id ) {
      let container = this.get('allContainers').byId(id);

      if ( container ) {
        if ( this.get('stack') && this.get('stack') === container.get('stack') ) {
          str = container.get('name');
        } else {
          str = `${ container.get('stack.name')  }/${  container.get('name') }`;
        }
      }
    }

    this.set('value', str);
  }),
  grouped: computed('allContainers.list.[]', 'canBalanceTo', 'canHaveContainers', function() {
    let list = this.get('allContainers.list');

    let exclude = this.get('exclude');

    if ( exclude ) {
      if ( !isArray(exclude) ) {
        exclude = [exclude];
      }

      list = list.filter((x) => !exclude.includes(x.id));
    }

    return this.get('allContainers').group(list);
  }),

});
