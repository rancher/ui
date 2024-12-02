import { inject as service } from '@ember/service';
import { validateChars, validateLength } from 'ember-api-store/utils/validate';
import Resource from 'ember-api-store/models/resource';
import { get, computed } from '@ember/object';
import { evaluate } from 'shared/utils/evaluate';
import C from 'ui/utils/constants';
import jsyaml from 'js-yaml';
import flatMap from 'shared/utils/flat-map';
import { isEmpty } from '@ember/utils';

const {
  HELM_VERSION_2:       helmV2,
  HELM_VERSION_3:       helmV3,
  HELM_VERSION_3_SHORT: helmV3Short,
} = C.CATALOG;

export default Resource.extend({
  scope: service(),
  intl:  service(),

  isHelm3: computed('helmVersion', function() {
    const { helmVersion = helmV2 } = this;

    if (helmVersion === helmV3 || helmVersion === helmV3Short) {
      return true;
    }

    return false;
  }),

  headers: computed('project.current.id', 'scope.currentProject.id', function() {
    return { [C.HEADER.PROJECT_ID]: get(this, 'scope.currentProject.id') };
  }),

  filesAsArray: computed('files', function() {
    var obj = (this.files || {});
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
    const originQuestions = this.questions || [];

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

  validationErrors(answersMap) {
    const {
      intl, allQuestions, valuesYaml
    } = this;

    const filteredQuestions = allQuestions.filter((q) => evaluate(q, allQuestions));
    let errors              = [];
    let parsedYamlAnswers   = null;

    if (valuesYaml) {
      try {
        parsedYamlAnswers = jsyaml.safeLoad(valuesYaml);
      } catch ( err ) {
        return [err];
      }

      if (parsedYamlAnswers) {
        let flatParsed = flatMap(parsedYamlAnswers);

        Object.keys(flatParsed).forEach((fp) => {
          let questionMatch = filteredQuestions.findBy('variable', fp);

          if (questionMatch) {
            let answer = flatParsed[fp] || null;

            if ( questionMatch.required && questionMatch.type !== 'boolean' && isEmpty(answer) ) {
              errors.push(intl.t('validation.required', { key: questionMatch.label }));
            }

            if (answer) {
              validateLength(answer, questionMatch, questionMatch.label, intl, errors);
              validateChars(answer, questionMatch, questionMatch.label, intl, errors);
            }
          }
        });
      }
    } else {
      if ( filteredQuestions ) {
        filteredQuestions.forEach((item) => {
          if ( item.required && item.type !== 'boolean' && isEmpty(answersMap[item.variable]) ) {
            errors.push(intl.t('validation.required', { key: item.label }));
          }

          if ( item.answer ) {
            validateLength(item.answer, item, item.label, intl, errors);
            validateChars(item.answer, item, item.label, intl, errors);
          }
        });
      }
    }


    if ( errors.length > 0 ) {
      return errors;
    }

    errors = this._super(...arguments);

    return errors;
  },

});
