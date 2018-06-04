import Component from '@ember/component';
import layout from './template';
import { get } from '@ember/object';
import Step from 'pipeline/mixins/step';

const DEFAULT_CONFIG = { path: './deployment.yaml',  };

export default Component.extend(Step, {
  layout,

  config:        null,
  field:         'applyYamlConfig',
  defaultConfig: DEFAULT_CONFIG,

  validate() {
    const intl = get(this, 'intl');
    const errors = [];
    const config = get(this, 'config.applyYamlConfig');

    if (!config.path || config.path.trim() === '') {
      errors.push(intl.t('newPipelineStep.stepType.applyYaml.errors.path.required'));
    }

    return errors;
  },
});
