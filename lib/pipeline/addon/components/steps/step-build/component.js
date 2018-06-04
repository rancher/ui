import Component from '@ember/component';
import layout from './template';
import { get } from '@ember/object';
import { alias } from '@ember/object/computed';
import Step from 'pipeline/mixins/step';

const DEFAULT_CONFIG = {
  dockerfilePath: './Dockerfile',
  buildContext:   '.',
  tag:            '',
  pushRemote:     false,
  registry:       '',
};

export default Component.extend(Step, {
  layout,

  config:        null,
  field:         'publishImageConfig',
  defaultConfig: DEFAULT_CONFIG,

  registries: alias('projectDockerCredentials'),

  validate() {
    const intl = get(this, 'intl');
    const errors = [];
    const config = get(this, 'config.publishImageConfig');

    if ( !config.tag || config.tag.trim() === '' ) {
      errors.push(intl.t('newPipelineStep.stepType.build.errors.tag.required'));
    }

    if ( !config.dockerfilePath || config.dockerfilePath.trim() === '' ) {
      errors.push(intl.t('newPipelineStep.stepType.build.errors.dockerfilePath.required'));
    }

    if ( config.pushRemote && ( !config.registry || config.registry.trim() === '' ) ) {
      errors.push(intl.t('newPipelineStep.stepType.build.errors.registry.required'));
    }

    return errors;
  },
});
