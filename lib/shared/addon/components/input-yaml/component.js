import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { isSafari } from 'ui/utils/platform';
import layout from './template';
import { get, set } from '@ember/object';
import { Promise as EmberPromise, all } from 'rsvp';
import ThrottledResize from 'shared/mixins/throttled-resize';

export default Component.extend(ThrottledResize, {
  layout,
  settings: service(),
  mode: 'text',
  label:           null,
  namePlaceholder: '',
  nameRequired:    false,
  name:            null,
  value:           null,
  placeholder:     "",
  accept:          "text/*, .yml, .yaml",
  multiple:        false,
  viewportMargin: Infinity,
  maxHeight:       200,
  inputName:       false,
  canChangeName:   true,
  canUpload:       true,
  showUploadLabel: true,
  gutters: ["CodeMirror-lint-markers"],
  tagName: ['div'],

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

  onResize() {
    this.fit();
  },

  fit() {
    if ( get(this, 'maxHeight') === 'auto' ) {
      var container = this.$('.codemirror-container');
      if ( !container ) {
        return;
      }

      const position = container.position();
      if ( !position ) {
        return;
      }

      const desired = $(window).height() - position.top - 130;
      container.css('max-height', Math.max(400, desired));
    }
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

  actualAccept: function() {
    if ( isSafari ) {
      return '';
    } else {
      return get(this, 'accept');
    }
  }.property('accept'),
});
