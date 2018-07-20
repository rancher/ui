var C = {
  ENV_VARS: [
    '${CICD_GIT_REPO_NAME}',
    '${CICD_GIT_URL}',
    '${CICD_GIT_COMMIT}',
    '${CICD_GIT_REF}',
    '${CICD_GIT_BRANCH}',
    '${CICD_GIT_TAG}',
    '${CICD_TRIGGER_TYPE}',
    '${CICD_EVENT}',
    '${CICD_EXECUTION_ID}',
    '${CICD_EXECUTION_SEQUENCE}',
    '${CICD_PIPELINE_ID}',
    '${CICD_PROJECT_ID}',
    '${CICD_CLUSTER_ID}',
    '${CICD_LOCAL_REGISTRY}',
  ],
  DEFAULT_REGISTRY: 'index.docker.io',
  STEPS_CHOICES:    [{
    value: 'task',
    label: 'newPipelineStep.stepType.task.label'
  }, {
    value: 'build',
    label: 'newPipelineStep.stepType.build.label'
  }, {
    value: 'apply-yaml',
    label: 'newPipelineStep.stepType.applyYaml.label'
  }],
  BASE_IMAGES: [{
    label: 'gcc:latest',
    value: 'gcc:latest',
  },
  {
    label: 'golang:latest',
    value: 'golang:latest',
  },
  {
    label: 'php:latest',
    value: 'php:latest',
  },
  {
    label: 'java:6',
    value: 'java:6',
  },
  {
    label: 'java:7',
    value: 'java:7',
  },
  {
    label: 'java:8',
    value: 'java:8',
  },
  {
    label: 'node:latest',
    value: 'node:latest',
  },
  {
    label: 'python:latest',
    value: 'python:latest',
  },
  ],

  STEP_TYPES: [{
    name:  'runScriptConfig',
    label: 'runScript',
    type:  'task'
  }, {
    name:  'applyYamlConfig',
    label: 'applyYaml',
    type:  'apply-yaml'
  }, {
    name:  'publishImageConfig',
    label: 'publishImage',
    type:  'build'
  }, {
    name:  'buildImageConfig',
    label: 'buildImage',
    type:  'build-only'
  }],

  DEMO_REPOSITORIES: [{ url: 'https://github.com/rancher/pipeline-example-php.git',  }, { url: 'https://github.com/rancher/pipeline-example-maven.git',  }
  ]
};

export default C;
