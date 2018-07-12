const DEFAULT_REGISTRY = 'index.docker.io';

export let singleton = { hintAry: [] }

export function analyzeImageRepo(images) {

  if (!images){

    return '';

  }
  let output = {
    registry:   DEFAULT_REGISTRY,
    repository: '',
    tag:        ''
  };
  var splited = images.split('/');

  if (splited.length < 2){

    output.registry = DEFAULT_REGISTRY;
    let repoAndTag = splited[0].split(':');

    output.repository = repoAndTag[0];
    output.tag = repoAndTag[1] || 'latest';

  } else {

    if (splited[0].indexOf('.') !== -1){

      output.registry = splited[0]

    }
    let repoAndTag = splited[splited.length - 1].split(':');
    let repo = '';

    for (var i = 0; i < splited.length - 1; i++) {

      let item = splited[i];

      if (item.indexOf('.') === -1){

        repo += `${ item  }/`;

      }

    }
    repo += repoAndTag[0];
    output.repository = repo;
    output.tag = repoAndTag[1] || 'latest';

  }

  return output;

}

export const environmentTypes = [{
  label:   'C',
  value:   'gcc:latest',
  shell:   'make',
  version: [{
    value: '1.1',
    label: '1.1'
  }, {
    value: 'latest',
    label: 'latest'
  }]
}, {
  label:   'PHP',
  value:   'php:latest',
  shell:   'phpunit —configuration phpunit_conf.xml —coverage-text',
  version: [{
    value: '1.1',
    label: '1.1'
  }, {
    value: 'latest',
    label: 'latest'
  }]
}, {
  label:     'Go',
  value:     'golang:latest',
  fakeShell: 'go test',
  shell:     'go test',
  version:   [{
    value: '1.1',
    label: '1.1'
  }, {
    value: 'latest',
    label: 'latest'
  }]
}, {
  label:   'Java',
  value:   'java:latest',
  shell:   'javac',
  version: [{
    value: '1.1',
    label: '1.1'
  }, {
    value: 'latest',
    label: 'latest'
  }]
}, {
  label:   'NodeJs',
  value:   'node:latest',
  shell:   'npm install',
  version: [{
    value: '1.1',
    label: '1.1'
  }, {
    value: 'latest',
    label: 'latest'
  }]
}, {
  label: 'Custom',
  value: '',
  shell: '',
}];

export function environmentTypeObject(label, gitRepo) {

  let selectedRepo = environmentTypes.findBy('label', label);

  if (label === 'Go' && gitRepo){

    let gitAddress = gitRepo.replace('https://', '').replace('.git', '');
    let repoName = gitAddress.lastIndexOf('\/');
    let gitDir = gitAddress.slice(0, repoName);
    let preScript = `mkdir -p /go/src/${ gitDir }
ln -s \`pwd\` /go/src/${ gitAddress }
cd /go/src/${ gitAddress }
`;

    selectedRepo.shell = preScript + selectedRepo.fakeShell;

  }

  return selectedRepo;

}