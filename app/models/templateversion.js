import { inject as service } from '@ember/service';
import { validateChars, validateLength } from '@rancher/ember-api-store/utils/validate';
import Resource from '@rancher/ember-api-store/models/resource';
import { get, computed } from '@ember/object';
import { evaluate } from 'shared/utils/evaluate';
import C from 'ui/utils/constants';

export default Resource.extend({
  scope:   service(),
  intl:  service(),

  headers: computed('project.current.id', function() {
    return { [C.HEADER.PROJECT_ID]: get(this, 'scope.currentProject.id') };
  }),

  filesAsArray: computed('files', function() {
    var obj = (get(this, 'files') || {});
    var out = [];

    Object.keys(obj).forEach((key) => {
      out.push({
        name: key,
        body: obj[key]
      });
    });

    return out;
  }),

  allQuestions: computed('questions', function() {
    const out = [];
    const originQuestions = get(this, 'questions') || [];

    originQuestions.forEach((q) => {
      out.push(q);
      const subquestions = get(q, 'subquestions');

      if ( subquestions ) {
        subquestions.forEach((subq) => {
          if ( get(subq, 'showIf.length') > 0 ) {
            subq.showIf = `${ q.variable }=${ q.showSubquestionIf }&&${ subq.showIf }`;
          } else {
            subq.showIf = `${ q.variable }=${ q.showSubquestionIf }`;
          }

          if ( q.group ) {
            subq.group = q.group;
          }
        });
        out.pushObjects(subquestions);
      }
    });

    return out;
  }),
  validationErrors() {
    const intl = get(this, 'intl');
    let errors = [];
    const questions = get(this, 'allQuestions');
    const filteredQuestions = questions.filter((q) => evaluate(q, questions));

    if ( filteredQuestions ) {
      filteredQuestions.forEach((item) => {
        if ( item.required && item.type !== 'boolean' && !item.answer ) {
          errors.push(intl.t('validation.required', { key: item.label }));
        }

        if ( item.answer ) {
          validateLength(item.answer, item, item.label, intl, errors);
          validateChars(item.answer, item, item.label, intl, errors);
        }
      });
    }
    if ( errors.length > 0 ) {
      return errors;
    }
    errors = this._super(...arguments);

    return errors;
  },

});
