import Component from '@ember/component';
import layout from './template';
import { get } from '@ember/object';
import C from 'shared/utils/pipeline-constants';
import Step from 'pipeline/mixins/step';

const DEFAULT_CONFIG = { shellScript: '',  };

export default Component.extend(Step, {
  layout,

  config:        null,
  field:         'runScriptConfig',
  defaultConfig: DEFAULT_CONFIG,

  validate() {
    const intl = get(this, 'intl');
    const errors = [];
    const config = get(this, 'config.runScriptConfig');

    if (!config.image || config.image.trim() === '') {
      errors.push(intl.t('newPipelineStep.stepType.task.errors.image.required'));
    }
    if (config.shellScript.trim() === '') {
      errors.push(intl.t('newPipelineStep.stepType.task.errors.shellScript.required'));
    }

    return errors;
  },
  imagesChoices: C.BASE_IMAGES,

});
