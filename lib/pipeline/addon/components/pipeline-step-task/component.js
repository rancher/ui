import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { environmentTypes, environmentTypeObject } from 'pipeline/utils/pipelineStep';
import layout from './template';
import { get, set } from '@ember/object';

export default Component.extend({
  layout,
  languageToLabel: {
    JavaScript: 'NodeJs',
    Go:         'Go',
    C:          'C'
  },
  environmentTypes,
  selectedType: 'Go',
  customImage:  {
    selectableTags: [],
    repo:           '',
    tag:            ''
  },
  routeState:          alias('modalOpts.routeState'),
  runScriptConfig:     alias('selectedModel.runScriptConfig'),
  selectedTypeObserve: function(){

    let selectedType = get(this, 'selectedType');

    if (selectedType !== 'Custom'){

      let selectedEnvironmentTypes = environmentTypeObject(selectedType, get(this, 'pipeline').stages[0].steps[0].sourceCodeConfig.url);

      set(this, 'runScriptConfig.shellScript', selectedEnvironmentTypes.shell);
      let selectedImage = selectedEnvironmentTypes.value.split(':');

      set(this, 'customImage', {
        selectableTags: selectedEnvironmentTypes.version,
        repo:           selectedImage[0],
        tag:            selectedImage[1]
      });

    } else {

      set(this, 'runScriptConfig.isShell', true);

    }

  }.observes('selectedType'),
  enviromentImageObserve: function(){

    let customImage = get(this, 'customImage');

    set(this, 'runScriptConfig.image', `${ customImage.repo }:${ customImage.tag }`);

  }.observes('customImage.{repo,tag}'),
  init(){

    this._super(...arguments);
    this.stepInitial();

  },
  actions: {
    changeTaskModel(state){

      set(this, 'runScriptConfig.isShell', state);

    }
  },
  stepInitial(){

    let runScriptConfig = get(this, 'runScriptConfig');
    let routeState = get(this, 'routeState');

    if (runScriptConfig.image){

      this.setLanguageEnvironment(runScriptConfig);

    } else {

      let label = get(this, 'languageToLabel')[routeState.language] || 'Custom';

      set(this, 'selectedType', label);
      if (label !== 'Custom'){

        this.selectedTypeObserve();
        this.enviromentImageObserve();

      }

    }

  },
  setLanguageEnvironment(runScriptConfig){

    let image = runScriptConfig.image;
    let selectedType = 'Custom';

    if (runScriptConfig.isShell){

      let splitedImage = image.split(':');
      let imageName = splitedImage[0];
      /* unused, -- VJF
      let imageTag = 'latest';
      if(splitedImage[1]){
        imageTag = splitedImage[1];
      }
      */

      let environmentTypes = get(this, 'environmentTypes');
      let shouldSelectedType = environmentTypes.find((ele) => {

        let eleImageName = ele.value.split(':')[0];

        if (eleImageName === imageName){

          return true

        }

      });

      if (shouldSelectedType){

        selectedType = shouldSelectedType.label;
        let selectedImage = shouldSelectedType.value.split(':');

        set(this, 'customImage', {
          selectableTags: shouldSelectedType.version,
          repo:           selectedImage[0],
          tag:            selectedImage[1]
        });

      }

    }
    set(this, 'selectedType', selectedType);

  },
});
