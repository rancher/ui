import Ember from 'ember';
import { isSafari } from 'ui/utils/platform';

export default Ember.Component.extend({
  settings: Ember.inject.service(),

  label:           null,
  namePlaceholder: '',
  name:            null,
  value:           null,
  placeholder:     "",
  accept:          "text/*",
  minHeight:       0,
  maxHeight:       200,
  inputName:       false,
  canChangeName:   true,
  canUpload:       true,
  showUploadLabel: true,

  tagName: ['div'],
  classNames: ['box','mb-10','p-10','pt-0'],

  _boundChange: null,
  shouldChangeName: true,

  actions: {
    click() {
      this.$('INPUT[type=file]')[0].click();
    },

    wantsChange() {
      this.set('shouldChangeName', true);
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
        this.setProperties({
          name: file.name,
          shouldChangeName: false,
        });
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
