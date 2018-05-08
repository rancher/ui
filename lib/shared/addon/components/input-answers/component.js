import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { get, set, computed, observer } from '@ember/object';
import { on } from '@ember/object/evented';
import { isSafari } from 'ui/utils/platform';
import { evaluate } from 'shared/utils/evaluate';
import layout from './template';

const HIDDEN = 'Hidden';

export default Component.extend({
  layout,
  originQuestions: alias('selectedTemplate.questions'),
  pasteOrUpload: false,
  accept: '.yml, .yaml',
  showHeader: true,
  answerSections: null,
  _boundChange: null,

  questions: computed('originQuestions', function() {
    const out = [];
    const originQuestions = get(this, 'originQuestions');
    originQuestions.forEach((q) => {
      out.push(q);
      const subquestions = get(q, 'subquestions');
      if ( subquestions ) {
        subquestions.forEach((subq) => {
          subq.showIf = `${q.variable}=${q.showSubquestionIf}`;
          if ( q.group ) {
            subq.group = q.group;
          }
        });
        out.pushObjects(subquestions);
      }
    });
    return out;
  }),

  didInsertElement() {
    this.set('_boundChange', (event) => { this.change(event); });
    this.$('INPUT[type=file]').on('change', this.get('_boundChange'));
  },

  change(event) {
    var input = event.target;
    if ( input.files && input.files[0] ) {
      let file = input.files[0];

      var reader = new FileReader();
      reader.onload = (event2) => {
        var out = event2.target.result;

        this.set('pastedAnswers', out);
        input.value = '';
      };
      reader.readAsText(file);
    }
  },

  pastedAnswers: computed('pasteOrUpload', {
    get( /* key */ ) {
      var questions = this.get('questions');
      var out = {};
      questions.forEach((q) => {
        out[q.variable] = q.answer || q.default || '';
      });
      return YAML.stringify(out);
    },

    set(key, value) {
      let qa = YAML.parse(value);
      let questions = this.get('questions');
      if (qa) {
        Object.keys(qa).forEach((q) => {
          set(questions.findBy('variable', q), 'answer', qa[q]);
        });
      }
      return value;
    }
  }),

  actions: {
    upload() {
      this.$('INPUT[type=file]')[0].click();
    },
    showPaste() {
      this.set('pasteOrUpload', true);
    },
    cancel() {
      this.set('pasteOrUpload', false);
    }
  },

  actualAccept: computed('accept', function() {
    if ( isSafari ) {
      return '';
    } else {
      return this.get('accept');
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

    const filterdQuestions = questions.filter((q) => evaluate(q, questions));
    newQuestions = filterdQuestions.map((q) => q.variable).sort();

    
    const sections = {};
    const notInAnySection = [];

    filterdQuestions.forEach((item) => {
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
        data: sections[key],
      });
    });

    if ( notInAnySection.length ) {
      allSections.push({
        data: notInAnySection,
      });
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
});
