import Component from '@ember/component';
import layout from './template';

export default Component.extend({
  layout,
  value: null,

  json: function() {
    var value = `${ this.get('value') || '' }`;

    if (value === '{}' || value === '[]') {
      return false
    }

    if ( ['[', '{'].indexOf(value.substr(0, 1)) >= 0 ) {
      try {
        var pretty = JSON.stringify(JSON.parse(value), null, 2);

        return pretty;
      } catch (e) {
      }
    }

    return null;
  }.property('value'),
});
