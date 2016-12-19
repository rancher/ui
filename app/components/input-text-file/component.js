import Ember from 'ember';
import { isSafari } from 'ui/utils/platform';

export default Ember.Component.extend({
  value        : null,
  placeholder  : "",
  accept       : "text/*",
  btnClass     : "btn btn-primary",
  encode       : false,
  minHeight    : 0,
  maxHeight    : 200,

  tagName      : ['div'],
  classNames   : ['input-group'],

  _boundChange : null,

  actions: {
    click() {
      this.$('INPUT[type=file]')[0].click();
    }
  },

  didInsertElement() {
    this.set('_boundChange', (event) => { this.change(event); });
    this.$('INPUT[type=file]').on('change', this.get('_boundChange'));
  },

  willDestroyElement() {
    this.$('INPUT[type=file]').off('change', this.get('_boundChange'));
  },

  change(event) {
    var input = event.target;
    if ( input.files && input.files[0] ) {
      var reader = new FileReader();
      reader.onload = (event2) => {
        var out = event2.target.result;

        if (this.get('encode')) {
          out = btoa(out);
        }

        this.set('value', out);
        input.value = '';
      };
      reader.readAsText(input.files[0]);
    }
  },

  actualAccept: function() {
    if ( isSafari ) {
      return '';
    } else {
      return this.get('accept');
    }
  }.property('accept'),
});
