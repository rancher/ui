import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import { environmentTypes , environmentTypeObject } from 'pipeline/utils/pipelineStep';
import layout from './template';

export default Component.extend({
  layout,
  languageToLabel: {
    JavaScript: 'NodeJs',
    Go: 'Go',
    C: 'C'
  },
  environmentTypes,
  selectedType: 'Go',
  customImage: {
    selectableTags: [],
    repo: '',
    tag: ''
  },
  routeState: alias('modalOpts.routeState'),
  runScriptConfig: alias('selectedModel.runScriptConfig'),
  init(){
    this._super(...arguments);
    this.stepInitial();
  },
  stepInitial(){
    let runScriptConfig = this.get('runScriptConfig');
    let routeState = this.get('routeState');
    if(runScriptConfig.image){
      this.set('selectedType', 'Custom');
    }else{
      let label = this.get('languageToLabel')[routeState.language]|| 'Custom';
      this.set('selectedType', label);
      if(label!=='Custom'){
        this.selectedTypeObserve();
        this.enviromentImageObserve();
      }
    }
  },
  selectedTypeObserve: function(){
    let selectedType = this.get('selectedType');
    if(selectedType !== 'Custom'){
      let selectedEnvironmentTypes = environmentTypeObject(selectedType, this.get('pipeline').stages[0].steps[0].sourceCodeConfig.url);
      this.set('runScriptConfig.shellScript', selectedEnvironmentTypes.shell);
      let selectedImage = value.split(':');
      this.set('customImage',{
        selectableTags: selectedEnvironmentTypes.version,
        repo: selectedImage[0],
        tag: selectedImage[1]
      });
    }
    else{
      this.set('runScriptConfig.isShell', true);
    }
  }.observes('selectedType'),
  enviromentImageObserve: function(){
    let customImage = this.get('customImage');
    this.set('runScriptConfig.image', `${customImage.repo}:${customImage.tag}`);
  }.observes('customImage.{repo,tag}'),
  actions: {
    changeTaskModel(state){
      this.set('runScriptConfig.isShell',state);
    }
  }
});
