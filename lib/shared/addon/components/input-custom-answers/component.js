import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { computed, get, set, setProperties } from '@ember/object';
import { isSafari } from 'ui/utils/platform';
import { inject as service } from '@ember/service';
import layout from './template';
import jsyaml from 'js-yaml';
import InputAnswers from 'shared/mixins/input-answers';
import convertDotAnswersToYaml from 'shared/utils/convert-yaml';
import { isArray } from '@ember/array';

export default Component.extend(InputAnswers, {
  intl:              service(),
  growl:             service(),

  layout,
  pasteOrUpload:     false,
  accept:            '.yml, .yaml',
  app:               null,
  isMultiClusterApp: false,
  intialAnswerMap:   null,
  valuesYaml:        alias('selectedTemplate.valuesYaml'),

  init() {
    this._super(...arguments);

    this.initPasteOrUpload();
  },

  // shared actions exist in mixin
  actions: {
    updateAnswers(answers) {
      const { isMultiClusterApp } = this;

      if (isMultiClusterApp) {
        set(this, 'app.answers.firstObject.values', answers);
      } else {
        set(this, 'app.answers', answers);
      }
    },
  },

  applicationAnswers: computed('app.answers', 'app.answers.firstObject.values', function() {
    const answers = isArray(get(this, 'app.answers')) ? get(this, 'app.answers.firstObject.values') : get(this, 'app.answers');

    return answers;
  }),

  actualAccept: computed('accept', function() {
    if ( isSafari ) {
      return '';
    } else {
      return get(this, ('accept'));
    }
  }),

  pastedAnswers: computed('pasteOrUpload', {
    get( /* key */ ) {
      let valuesYaml;

      const { isMultiClusterApp } = this;

      if ( isMultiClusterApp ) {
        valuesYaml = get(this, 'app.answers.firstObject.valuesYaml') || '';
      } else {
        valuesYaml = get(this, 'app.valuesYaml') || '';
      }

      let yaml;

      if ( valuesYaml ) {
        yaml = valuesYaml;
      } else {
        const input = {};
        let questions = get(this, 'applicationAnswers');

        Object.keys(questions).forEach((q) => {
          if ( questions[q] !== undefined && questions[q] !== null ) {
            input[q] = questions[q];
          } else {
            input[q.variable] = '';
          }
        });

        yaml = convertDotAnswersToYaml(input);
      }

      set(this, 'valuesYaml', yaml);

      return yaml;
    },

    set(key, value) {
      try {
        jsyaml.safeLoad(value);
      } catch ( err ) {
        set(this, 'yamlErrors', [`YAML Parse Error: ${ err.snippet } - ${ err.message }`]);

        return value;
      }

      setProperties(this, {
        yamlErrors: [],
        valuesYaml: value,
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

  initPasteOrUpload() {
    const { isMultiClusterApp } = this;

    if (isMultiClusterApp) {
      if ( get(this, 'app.answers.firstObject.valuesYaml') ) {
        set(this, 'pasteOrUpload', true);
      }
    } else {
      if ( get(this, 'app.valuesYaml') ) {
        set(this, 'pasteOrUpload', true);
      }
    }
  },
});
