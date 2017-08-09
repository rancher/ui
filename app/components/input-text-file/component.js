import Ember from 'ember';
import { isSafari } from 'ui/utils/platform';

export default Ember.Component.extend({
  label        : null,
  namePlaceholder: '',
  name         : null,
  value        : null,
  placeholder  : "",
  accept       : "text/*",
  minHeight    : 0,
  maxHeight    : 200,
  inputName    : false,
  canChangeName: true,
  showUploadLabel: true,

  tagName      : ['div'],
  classNames   : ['box', 'mt-10'],

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
      let file = input.files[0];
      if ( this.get('canChangeName') ) {
        this.set('name', file.name);
      }

      var reader = new FileReader();
      reader.onload = (event2) => {
        var out = event2.target.result;

        this.set('value', out);
        input.value = '';
      };
      reader.readAsText(file);
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
