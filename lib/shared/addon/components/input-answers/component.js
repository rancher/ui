import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { get, set, computed, observer } from '@ember/object';
import { on } from '@ember/object/evented';
import { isSafari } from 'ui/utils/platform';
import { evaluate } from 'shared/utils/evaluate';
import { inject as service } from '@ember/service';
import layout from './template';
import YAML from 'yamljs';
import convertDotAnswersToYaml from 'shared/utils/convert-yaml';

const HIDDEN = 'Hidden';

export default Component.extend({
  growl: service(),

  layout,
  pasteOrUpload:     false,
  isMultiClusterApp: false,
  accept:            '.yml, .yaml',
  showHeader:        true,
  answerSections:    null,

  questions:       alias('selectedTemplate.allQuestions'),
  valuesYaml:      alias('selectedTemplate.valuesYaml'),

  init() {
    this._super(...arguments);

    const { isMultiClusterApp } = this;

    if ( isMultiClusterApp ) {
      set(this, 'pasteOrUpload', !!get(this, 'app.answers.firstObject.valuesYaml'));
    } else {
      set(this, 'pasteOrUpload', !!get(this, 'app.valuesYaml'));
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
      set(this, 'valuesYaml', null);
      set(this, 'pasteOrUpload', false);
    }
  },

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
        const questions = get(this, 'questions');
        const input = {};

        questions.forEach((q) => {
          if ( q.answer !== undefined && q.answer !== null ) {
            input[q.variable] = q.answer;
          } else if ( q.default !== undefined && q.default !== null ) {
            input[q.variable] = q.default;
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
        YAML.parse(value);
      } catch ( err ) {
        set(this, 'yamlErrors', [`YAML Parse Error: ${ err.snippet } - ${ err.message }`]);

        return value;
      }

      set(this, 'yamlErrors', []);
      set(this, 'valuesYaml', value);

      return value;
    }
  }),

  actualAccept: computed('accept', function() {
    if ( isSafari ) {
      return '';
    } else {
      return get(this, 'accept');
    }
  }),

  answerDidChange: on('init', observer('questions.@each.answer', function() {
    const questions = (get(this, 'questions') || []);
    let oldQuestions = [];
    let newQuestions = [];

    (get(this, 'answerSections') || []).forEach((section) => {
      section.data.forEach((group) => {
        group.forEach((q) => {
          oldQuestions.push(q.variable);
        });
      });
    });
    oldQuestions = oldQuestions.sort();

    const filteredQuestions = questions.filter((q) => evaluate(q, questions));

    newQuestions = filteredQuestions.map((q) => q.variable).sort();


    const sections = {};
    const notInAnySection = [];

    filteredQuestions.forEach((item) => {
      if ( item.group ) {
        if ( item.group === HIDDEN ) {
          return;
        }

        if ( !sections[item.group] ) {
          sections[item.group] = [];
        }
        sections[item.group].push(item);
      } else {
        notInAnySection.push(item);
      }
    });
    const allSections = [];

    Object.keys(sections).forEach((key) => {
      allSections.push({
        title: key,
        data:  sections[key],
      });
    });

    if ( notInAnySection.length ) {
      allSections.push({ data: notInAnySection, });
    }

    const out = [];

    allSections.forEach((section) => {
      const data = [];
      let dataIndex = 0;

      out.push({
        title: section.title,
        data,
      });

      section.data.forEach((item, index) => {
        if (index % 2 === 0) {
          data.push([item])
          dataIndex++
        } else {
          data[dataIndex - 1].push(item)
        }
      });
    });


    if (newQuestions.toString() !== oldQuestions.toString()) {
      set(this, 'answerSections', out);
    }
  })),

  change(event) {
    if ( get(this, 'pasteOrUpload') ) {
      return;
    }

    var input = event.target;

    if ( input.files && input.files[0] ) {
      let file = input.files[0];

      var reader = new FileReader();

      reader.onload = (event2) => {
        var out = event2.target.result;

        set(this, 'pastedAnswers', out);
        input.value = '';
      };

      reader.onerror = (err) => {
        get(this, 'growl').fromError(get(err, 'srcElement.error.message'));
      };

      reader.readAsText(file);
    }
  },

});
