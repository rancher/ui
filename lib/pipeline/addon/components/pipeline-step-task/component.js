import Component from '@ember/component';
import { alias } from '@ember/object/computed';
import {environmentTypes} from 'pipeline/utils/pipelineStep';
import layout from './template';

export default Component.extend({
  layout,
  languageToLabel: {
    JavaScript: 'NodeJs',
    Go: 'Go',
    C: 'C'
  },
  environmentTypes,
  selectedType: 'go',
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
      this.set('selectedType', 'custom');
    }else{
      let label = this.get('languageToLabel')[routeState.language]|| 'custom';
      this.set('selectedType', label);
      if(label!=='custom'){
        this.selectedTypeObserve();
        this.enviromentImageObserve();
      }
    }
  },
  selectedTypeObserve: function(){
    let selectedType = this.get('selectedType');
    if(selectedType !== 'custom'){
      let selectedEnvironmentTypes = this.get('environmentTypes').find(ele=>ele.label===selectedType);
      if(selectedEnvironmentTypes){
        let value = selectedEnvironmentTypes.value;
        this.set('runScriptConfig.isShell', true);
        this.set('runScriptConfig.shellScript', selectedEnvironmentTypes.shell);
        let selectedImage = value.split(':');
        this.set('customImage',{
          selectableTags: selectedEnvironmentTypes.version,
          repo: selectedImage[0],
          tag: selectedImage[1]
        });
      }
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
