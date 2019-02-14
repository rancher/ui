import Component from '@ember/component';
import { computed, get, set } from '@ember/object';
import { isSafari } from 'ui/utils/platform';
import { inject as service } from '@ember/service';
import layout from './template';
import YAML from 'yamljs';

export default Component.extend({
  intl:  service(),
  growl: service(),

  layout,
  pasteOrUpload:     false,
  accept:            '.yml, .yaml',
  app:               null,
  isMultiClusterApp: false,
  intialAnswerMap:   null,

  init() {
    this._super(...arguments);

    this.initInitialAnswerMap();
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
      set(this, 'selectedTemplate.valuesYaml', null);
    },

    updateAnswers(answers) {
      const { isMultiClusterApp } = this;

      if (isMultiClusterApp) {
        set(this, 'app.answers.firstObject.values', answers);
      } else {
        set(this, 'app.answers', answers);
      }
    },
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
      const { isMultiClusterApp } = this;

      if (isMultiClusterApp) {
        return get(this, 'app.answers.firstObject.valuesYaml') || '';
      } else {
        return get(this, 'app.valuesYaml') || '';
      }
    },

    set(key, value) {
      try {
        YAML.parse(value);
      } catch ( err ) {
        set(this, 'yamlErrors', [`YAML Parse Error: ${ err.snippet } - ${ err.message }`]);

        return value;
      }

      set(this, 'yamlErrors', []);
      set(this, 'selectedTemplate.valuesYaml', value);

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

  initInitialAnswerMap() {
    const { isMultiClusterApp } = this;
    let answers;

    if (isMultiClusterApp) {
      answers = this.getInitialMultiClusterAnswerMap();
      if ( get(this, 'app.answers.firstObject.valuesYaml') ) {
        set(this, 'pasteOrUpload', true);
      }
    } else {
      answers = this.getInitialMap();
      if ( get(this, 'app.valuesYaml') ) {
        set(this, 'pasteOrUpload', true);
      }
    }

    set(this, 'intialAnswerMap', answers);
  },

  getInitialMultiClusterAnswerMap() {
    return get(this, 'app.answers.firstObject.values');
  },

  getInitialMap() {
    return get(this, 'app.answers');
  },
});
