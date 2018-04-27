import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import { get, set, computed, observer } from '@ember/object';
import { on } from '@ember/object/evented';
import { isSafari } from 'ui/utils/platform';
import { evaluate } from 'shared/utils/evaluate';
import layout from './template';

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
          subq.isSub = true;
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

  pastedAnswers: computed({
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
      section.forEach((group) => {
        group.forEach((q) => {
          oldQuestions.push(q.variable);
        });
      });
    });
    oldQuestions = oldQuestions.sort();

    const filterdQuestions = questions.filter((q) => evaluate(q, questions));
    newQuestions = filterdQuestions.map((q) => q.variable).sort();

    
    const sections = [];
    let sectionIndex = 0;

    filterdQuestions.forEach((item, index) => {
      const pre = filterdQuestions.objectAt(index -1);
      if ( index === 0 || get(item, 'subquestions.length') ||
            ((pre && (get(pre, 'isSub') || get(pre, 'subquestions.length'))) && !get(item, 'isSub'))) {
        sections.push([item]);
        sectionIndex++;
      } else {
        sections[sectionIndex-1].push(item);
      }
    });
    
    const out = [];
    sections.forEach((section) => {
      const group = [];
      let groupIndex = 0;

      out.push(group);

      section.forEach((item, index) => {
        if (index % 2 === 0) {
          group.push([item])
          groupIndex++
        } else {
          group[groupIndex - 1].push(item)
        }
      });
    });

    
    if (newQuestions.toString() !== oldQuestions.toString()) {
      set(this, 'answerSections', out);
      debugger
    }
  })),
});
