import Mixin from '@ember/object/mixin';
import { /* get,  */set, setProperties } from '@ember/object';
import flatMap from 'shared/utils/flat-map';
import jsyaml from 'js-yaml';

export default Mixin.create({

  actions: {
    upload() {
      this.$('INPUT[type=file]')[0].click();
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

    try {
      parsedYaml = jsyaml.safeLoad(valuesYaml);
    } catch ( err ) {
      set(this, 'yamlErrors', [`YAML Parse Error: ${ err.snippet } - ${ err.message }`]);
    }

    if (parsedYaml) {
      let flatParsedYaml = flatMap(parsedYaml);

      Object.keys(flatParsedYaml).forEach((fp) => {
        if (questions) {
          let match = (this.questions || []).findBy('variable', fp);

          if (match && match.type !== 'enum' && match.type !== 'storageclass') {
            set(match, 'answer', flatParsedYaml[fp]);
          } else {
            let out = {
              lostKey:   fp,
              lostValue: flatParsedYaml[fp]
            };

            missing.push(out);
          }
        } else {
          answersMap[fp] = flatParsedYaml[fp];
        }
      });

      if (missing.length >= 1) {
        this.modalService.toggleModal('modal-confirm-yaml-switch', {
          propertiesGoingToBeLost: missing,
          finish:                  this.finishBackToForm.bind(this),
        })
      } else {
        if (Object.keys(answersMap).length >= 1) {
          set(this, 'app.answers', answersMap);
        }
      }

      this.finishBackToForm();
    }
  },

  finishBackToForm(cbToCloseModal) {
    if (cbToCloseModal) {
      cbToCloseModal();
    }

    setProperties(this, {
      yamlErrors:    [],
      valuesYaml:    '',
      pasteOrUpload: false,
    });
  },
});
