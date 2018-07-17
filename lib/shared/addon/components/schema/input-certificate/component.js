import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  field: null,
  value: null,

  choices: null,
  loading: true,

  default: alias('field.default'),
  init() {
    this._super(...arguments);

    this.get('store').findAll('certificate').then((choices) => {
      var def = this.get('default');

      if ( this.get('value') === undefined ) {
        if ( def ) {
          var match = choices.filterBy('name', def);

          if ( match.length > 0 ) {
            this.set('value', def);
          } else {
            this.set('value', null);
          }
        } else {
          this.set('value', null);
        }
      }

      this.setProperties({
        loading: false,
        choices
      });
    });
  },
});
