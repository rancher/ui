import Component from '@ember/component';
import layout from './template';
import { inject as service } from '@ember/service';
import { computed, get, set, observer } from '@ember/object';
import { next } from '@ember/runloop';

export default Component.extend({
  scope: service(),
  intl:  service(),
  layout,

  tagName:               '',
  addSubrowQuestions:    null,
  selectedTemplateModel: null,
  removeAnswerOverride:  null,
  answer:                null,
  ownedSubquestions:     null,
  subquestionAnswers:    null,
  answerOverrides:       null,

  actions: {
    removeOverride(answer) {
      if (this.subquestionAnswers) {
        this.removeSubquestionsAndSend(this.subquestionAnswers);
      }

      next(() => {
        get(this, 'removeAnswerOverride')(answer)
      })
    },
  },

  scopeChanged: observer('answer.scope', function() {
    const subquestionAnswers = this.subquestionAnswers || [];
    const { answer } = this;

    if (subquestionAnswers.length > 0) {
      subquestionAnswers.forEach( (sq) => set(sq, 'scope', get(answer, 'scope')));
    }
  }),

  allProjectsAndClusters: computed('scope.allProjects.[]', 'scope.allClusters.[]', 'primaryResource.targets.@each.projectId', function() {
    let out = [];

    get(this, 'scope.allClusters').forEach( (c) => {
      out.pushObject({
        name:      this.intl.t('newMultiClusterApp.overrides.dropdown.allProjects', { clusterName: c.name }),
        value:     c.id,
        group:     this.intl.t('newMultiClusterApp.overrides.dropdown.clusterGroup', { clusterName: c.name }),
        isCluster: true,
      });

      c.get('projects').forEach( (p) => {
        out.pushObject({
          name:      p.name,
          value:     p.id,
          group:     this.intl.t('newMultiClusterApp.overrides.dropdown.clusterGroup', { clusterName: c.name }),
          isProject: true,
        });
      });
    });

    return out;
  }),

  allQuestions: computed('selectedTemplateModel.questions.[]', 'answer.answer', function() {
    let allQuestions = get(this, 'selectedTemplateModel.questions');
    const { answer } = this;
    let questionMatch;

    if (!allQuestions) {
      let questionAnswers = get(this, 'primaryResource.answers.firstObject.values');

      allQuestions = Object.keys(questionAnswers).map((q) => {
        return {
          label:    q,
          variable: q,
        };
      });
    }

    questionMatch = allQuestions.findBy('variable', get(answer, 'question'));

    let nueQuestions = [];

    allQuestions.forEach( (q) => {
      if (questionMatch && questionMatch.variable === q.variable) {
        if ( q.showSubquestionIf && q.subquestions) {
          let answerMatchesSubQuestionIf = false;

          if (answer.answer && answer.answer.toString) {
            answerMatchesSubQuestionIf = answer.answer.toString() === q.showSubquestionIf;
          }

          if (answerMatchesSubQuestionIf) {
            this.buildSubquestions(q.subquestions);
          } else {
            if (this.subquestionAnswers && this.subquestionAnswers.length > 0) {
              this.removeSubquestionsAndSend(this.subquestionAnswers);
            }
          }
        }
      }

      nueQuestions.pushObject(q);
    });

    return nueQuestions;
  }),

  buildSubquestions(subQuestions) {
    let subquestionAnswers = [];

    subQuestions.forEach( (sq) => {
      let subQuestionAnswerValue = sq.default;

      let nueOverride = {
        scope:         get(this, 'answer.scope'),
        question:      sq,
        answer:        subQuestionAnswerValue,
        isSubQuestion: true,
      };

      if (get(this, 'answerOverrides')) {
        let match = get(this, 'answerOverrides').filterBy('scope', get(this, 'answer.scope')).findBy('question', get(sq, 'variable'));

        if (match) {
          set(nueOverride, 'answer', get(match, 'answer'));
        }
      }

      subquestionAnswers.pushObject(nueOverride);
    });

    next(() => {
      set(this, 'subquestionAnswers', subquestionAnswers);

      get(this, 'addSubrowQuestions')(subquestionAnswers);
    });
  },

  removeSubquestionsAndSend(answers) {
    let removed = [].concat(answers);

    set(this, 'subquestionAnswers', null);

    next(() => {
      get(this, 'removeSubrowQuestions')(removed);
    });
  },

});
