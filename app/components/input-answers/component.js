import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { get, set, computed, observer } from '@ember/object';
import { on } from '@ember/object/evented';
import { isSafari } from 'ui/utils/platform';
import { evaluate } from 'shared/utils/evaluate';
import { inject as service } from '@ember/service';
import layout from './template';
import YAML from 'yamljs';

const HIDDEN = 'Hidden';

export default Component.extend({
  growl: service(),

  layout,
  pasteOrUpload:   false,
  accept:          '.yml, .yaml',
  showHeader:      true,
  answerSections:  null,

  originQuestions: alias('selectedTemplate.questions'),
  questions:       alias('selectedTemplate.allQuestions'),
  customAnswers:   alias('selectedTemplate.customAnswers'),

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

  pastedAnswers: computed('pasteOrUpload', {
    get( /* key */ ) {
      const questions = get(this, 'questions');
      const answers = get(this, 'customAnswers') || {};
      const out = {};

      questions.forEach((q) => {
        out[q.variable] = q.answer || q.default || '';
      });

      Object.keys(answers).forEach((key) => {
        if ( typeof out[key] === 'undefined' ) {
          out[key] = answers[key];
        }
      });

      return YAML.stringify(out);
    },

    set(key, value) {
      let qa;

      try {
        qa = YAML.parse(value);
      } catch ( err ) {
        set(this, 'yamlErrors', [`YAML Parse Error: ${ err.snippet } - ${ err.message }`]);

        return value;
      }

      set(this, 'yamlErrors', []);

      let questions = get(this, 'questions');
      const answers = {};

      if (qa) {
        Object.keys(qa).forEach((q) => {
          const question = questions.findBy('variable', q);

          if ( question ) {
            set(question, 'answer', qa[q]);
          } else {
            answers[q] = qa[q];
          }
        });
      }
      set(this, 'customAnswers', answers);

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
