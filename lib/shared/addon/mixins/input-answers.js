import Mixin from '@ember/object/mixin';
import { /* get,  */set, setProperties } from '@ember/object';
import flatMap from 'shared/utils/flat-map';
import jsyaml from 'js-yaml';
import { isEmpty } from '@ember/utils';
import $ from 'jquery';

export default Mixin.create({

  actions: {
    upload() {
      $(this.element).find('INPUT[type=file]').click();
    },
    showPaste() {
      set(this, 'pasteOrUpload', true);
    },
    cancel() {
      this.parseYamlAnswers();
    }
  },

  parseYamlAnswers() {
    let { valuesYaml, questions } = this;
    let parsedYaml                = null;
    let missing                   = [];
    let answersMap                = {};

    function pushMissing(key, value) {
      let out = {
        lostKey:   key,
        lostValue: value
      };

      missing.push(out);
    }

    function basicMatch(match) {
      return match && match.type !== 'enum' && match.type !== 'storageclass';
    }

    function enumAndFoundAnswerInOptionsMatch(match, answer) {
      return match.type === 'enum' && match.options.find((i) => i === answer)
    }

    function showIfFoundandShownIfMatch(showIfKey, showIfValue, showIfMatchValue, yaml) {
      return yaml.hasOwnProperty(showIfKey) && showIfMatchValue && showIfMatchValue === !!showIfValue;
    }

    try {
      parsedYaml = jsyaml.safeLoad(valuesYaml);
    } catch ( err ) {
      set(this, 'yamlErrors', [`YAML Parse Error: ${ err.snippet } - ${ err.message }`]);
    }

    if (parsedYaml) {
      let flatParsedYaml = flatMap(parsedYaml);

      // loop over the flat map yaml
      Object.keys(flatParsedYaml).forEach((fp) => {
        let answerFromParsedYaml = flatParsedYaml[fp];

        if (questions && !isEmpty(answerFromParsedYaml)) {
          // find the matching question
          let match = (this.questions || []).findBy('variable', fp);

          // no match
          if (isEmpty(match)) {
            pushMissing(fp, answerFromParsedYaml);
          } else {
            // type != enum || storageclass
            if (basicMatch(match)) {
              set(match, 'answer', answerFromParsedYaml);
            } else {
              // type == enum and we found the answer from the yaml in the default options
              if (enumAndFoundAnswerInOptionsMatch(match, answerFromParsedYaml)) {
                set(match, 'answer', answerFromParsedYaml);
              } else {
                // dependent question
                if (match.showIf) {
                  let [showIfKey, showIfValue] = match.showIf.split('=');
                  let showIfMatchValue         = flatParsedYaml[showIfKey];

                  // is it in the yaml & is the answer provided by the true and thats the show if value the same as the match value
                  if (showIfFoundandShownIfMatch(showIfKey, showIfValue, showIfMatchValue, flatParsedYaml)) {
                    if (answerFromParsedYaml) {
                      // storage class is weird, we represent the storage class as an enum in the UI but its from dynamiclly loaded data
                      // even if we have an answer it could not exist in the server data so we should alert the user that it could still cause a problem
                      if (match.type === 'storageclass') {
                        pushMissing(fp, answerFromParsedYaml);
                      }

                      set(match, 'answer', answerFromParsedYaml);
                    } else {
                      pushMissing(fp, answerFromParsedYaml);
                    }
                  }
                } else {
                  pushMissing(fp, answerFromParsedYaml);
                }
              }
            }
          }
        } else {
          if (isEmpty(answerFromParsedYaml)) {
            answersMap[fp] = answerFromParsedYaml;
          }
        }
      });

      if (missing.length >= 1) {
        this.modalService.toggleModal('modal-confirm-yaml-switch', {
          finish:                  this.finishBackToForm.bind(this),
          propertiesGoingToBeLost: missing,
        })
      } else {
        if (Object.keys(answersMap).length >= 1) {
          set(this, 'app.answers', answersMap);
        }
        this.finishBackToForm();
      }
    }
  },

  finishBackToForm(cbToCloseModal, canceled = false) {
    if (cbToCloseModal) {
      cbToCloseModal();
    }

    if (!canceled) {
      setProperties(this, {
        yamlErrors:    [],
        valuesYaml:    '',
        pasteOrUpload: false,
      });
    }
  },
});
