import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { isSafari } from 'ui/utils/platform';
import layout from './template';
import { get, set } from '@ember/object';
import { Promise as EmberPromise, all } from 'rsvp';
import { computed } from '@ember/object';


export default Component.extend({
  settings:         service(),
  growl:            service(),

  layout,
  label:            null,
  namePlaceholder:  null,
  nameRequired:     false,
  name:             null,
  value:            null,
  placeholder:      null,
  accept:           'text/*',
  multiple:         false,
  minHeight:        0,
  maxHeight:        200,
  inputName:        false,
  canChangeName:    true,
  canUpload:        true,
  showUploadLabel:  true,

  tagName:          ['div'],

  shouldChangeName: true,

  actions: {
    click() {
      this.$('INPUT[type=file]')[0].click();
    },

    wantsChange() {
      set(this, 'shouldChangeName', true);
    }
  },

  actualAccept: computed('accept', function() {
    if ( isSafari ) {
      return '';
    } else {
      return get(this, 'accept');
    }
  }),
  change(event) {
    var input = event.target;

    if ( !input.files || !input.files.length ) {
      return;
    }

    if ( get(this, 'canChangeName') ) {
      const firstName = input.files[0].name;

      if ( get(this, 'multiple') ) {
        const ext = firstName.replace(/.*\./, '');

        set(this, 'name', `multiple.${ ext }`);
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
          get(this, 'growl').fromError(get(err, 'srcElement.error.message'));
          reject(err);
        };

        reader.readAsText(file);
      }));
    }

    all(promises).then((res) => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      let value = res.join('\n');

      set(this, 'value', value);
      if ( value ) {
        this.sendAction('fileChosen');
      }
    }).finally(() => {
      input.value = '';
    });
  },

});
