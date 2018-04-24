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
  accept: '*',
  showHeader: true,
  answerGroups: null,
  _boundChange : null,

  questions: computed('originQuestions', function() {
    const out = [];
    const originQuestions = get(this, 'originQuestions');
    originQuestions.forEach((q) => {
      out.push(q);
      const subquestions = get(q, 'subquestions');
      if ( subquestions ) {
        subquestions.forEach((subq) => {
          subq.showIf = `${q.variable}=${q.showSubquestionIf}`;
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
    get(/* key */) {
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

  answerDidChange: on('init', observer('questions.@each.answer', function () {
    const group = [];
    let groupIndex = 0;
    const questions = (get(this, 'questions') || []);
    let oldQuestions = [];
    let newQuestions = [];
    (get(this, 'answerGroups') || []).forEach((group) => {
      group.forEach((q) => {
        oldQuestions.push(q.variable);
      });
    });
    oldQuestions = oldQuestions.sort();

    const filterdQuestions = questions.filter((q) => evaluate(q, questions));
    newQuestions = filterdQuestions.map((q) => q.variable).sort();

    filterdQuestions.forEach((item, index) => {
      if (index % 2 === 0) {
        group.push([item])
        groupIndex++
      } else {
        group[groupIndex - 1].push(item)
      }
    });
    
    if ( newQuestions.toString() !== oldQuestions.toString() ) {
      set(this, 'answerGroups', group);
    }
  })),
});
