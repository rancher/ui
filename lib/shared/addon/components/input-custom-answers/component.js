import Component from '@ember/component';
import { computed, get, set } from '@ember/object';
import { isSafari } from 'ui/utils/platform';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import json2yaml from 'json2yaml';
import layout from './template';
import YAML from 'yamljs';

var dotObject = null;

function convertKey(key) {
  let out = '';
  const splits = key.split('.');

  splits.forEach((split, index) => {
    if ( /^\d+$/.test(split) ) {
      out += `[${ split }]`;
    } else {
      out += index === 0 ? split : `.${ split }`;
    }
  })

  return out;
}

export default Component.extend({
  intl:  service(),
  growl: service(),

  layout,
  pasteOrUpload: false,
  showInput:     true,
  accept:        '.yml, .yaml',
  app:           null,

  init() {
    this._super(...arguments);


    if (!dotObject) {
      import('dot-object').then( (module) => {
        dotObject = module.default;
      });
    }
  },

  actions: {
    upload() {
      this.$('INPUT[type=file]')[0].click();
    },

    showPaste() {
      set(this, 'pasteOrUpload', true);
    },

    cancel() {
      set(this, 'pasteOrUpload', false);
    }
  },

  actualAccept: computed('accept', function() {
    if ( isSafari ) {
      return '';
    } else {
      return get(this, ('accept'));
    }
  }),

  pastedAnswers: computed('pasteOrUpload', {
    get() {
      const input = get(this, 'app.answers');
      const obj = {};

      Object.keys(input).forEach((key) => {
        const value = input[key];

        key = key.replace(/\]\[/g, '.').replace(/\]\./g, '.')
          .replace(/\[/g, '.');

        if ( key.startsWith('.') ) {
          key = key.substr(1, key.length);
        }

        if ( key.endsWith(']') ) {
          key = key.substr(0, key.length - 1);
        }
        dotObject.str(key, value, obj);
      });

      return Object.keys(obj).length > 0 ? json2yaml.stringify(obj) : `# ${ get(this, 'intl').t('inputAnswers.yamlProtip') }\n`;
    },

    set(key, value) {
      const out = {};
      let json;

      try {
        json = YAML.parse(value);
      } catch ( err ) {
        set(this, 'yamlErrors', [`YAML Parse Error: ${ err.snippet } - ${ err.message }`]);

        return value;
      }

      set(this, 'yamlErrors', []);

      if ( json && typeof json === 'object' ) {
        const dot = {};

        dotObject.dot(json, dot);
        Object.keys(dot).forEach((key) => {
          const value = (typeof dot[key] === 'object') ? JSON.stringify(dot[key]) : dot[key];

          key = convertKey(key);

          out[key] = value
        });
      } else {
        return value;
      }

      set(this, 'showInput', false);
      set(this, 'app.answers', out);

      next(() => {
        set(this, 'showInput', true);
      });

      return value;
    }
  }),

  change(event) {
    if ( get(this, 'pasteOrUpload') ) {
      return;
    }

    const input = event.target;

    if ( input.files && input.files[0] ) {
      let file = input.files[0];

      const reader = new FileReader();

      reader.onerror = (err) => {
        get(this, 'growl').fromError(get(err, 'srcElement.error.message'));
      };

      reader.onload = (event2) => {
        const out = event2.target.result;

        set(this, 'pastedAnswers', out);
        input.value = '';
      };
      reader.readAsText(file);
    }
  },
});
