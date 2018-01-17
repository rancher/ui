import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { isSafari } from 'ui/utils/platform';
import layout from './template';
import { get, set } from '@ember/object';
import { Promise as EmberPromise, all } from 'rsvp';


export default Component.extend({
  layout,
  settings: service(),

  label:           null,
  namePlaceholder: '',
  nameRequired:    false,
  name:            null,
  value:           null,
  placeholder:     "",
  accept:          "text/*",
  multiple:        false,
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
      set(this, 'shouldChangeName', true);
    }
  },

  didInsertElement() {
    set(this, '_boundChange', (event) => { this.change(event); });
    this.$('INPUT[type=file]').on('change', get(this, '_boundChange'));
  },

  willDestroyElement() {
    this.$('INPUT[type=file]').off('change', get(this, '_boundChange'));
  },

  change(event) {
    var input = event.target;

    if ( !input.files || !input.files.length ) {
      return;
    }

    if ( get(this, 'canChangeName') ) {
      const firstName = input.files[0].name;
      if ( get(this, 'multiple') ) {
        const ext = firstName.replace(/.*\./,'');
        set(this, 'name', 'multiple.'+ext);
      } else {
        set(this, 'name', firstName);
      }

      set(this, 'shouldChangeName', false);
    }

    const promises = [];
    let file;
    for ( let i = 0 ; i < input.files.length ; i++ ) {
      file = input.files[i];
      promises.push(new EmberPromise((resolve, reject) => {
        var reader = new FileReader();

        reader.onload = (res) => {
          var out = res.target.result;
          resolve(out);
        };

        reader.onerror = (err) => {
          reject(err);
        };

        reader.readAsText(file);
      }));
    }

    all(promises).then((res) => {
      let value = res.join('\n');
      set(this, 'value', value);
    }).finally(() => {
      input.value = '';
    });
  },

  actualAccept: function() {
    if ( isSafari ) {
      return '';
    } else {
      return get(this, 'accept');
    }
  }.property('accept'),
});
