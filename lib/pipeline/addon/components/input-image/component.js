import Component from '@ember/component';
import { on } from '@ember/object/evented';
import { observer } from '@ember/object';
import {analyzeImageRepo} from 'pipeline/utils/pipelineStep';
import layout from './template';
import { inject as service } from '@ember/service';
import { set, get } from '@ember/object';

export default Component.extend({
  layout,
  registryField: false,
  value: '',
  registries: '',
  store: service(),
  width: function(){
    let registryFiled = this.get('registryField');
    if(registryFiled){
      return '30%';
    }
    return '48%';
  }.property('registryFiled'),
  state: {
    registries: [],
    imageRegistry: '',
    imageRepo: '',
    imageTag: '',
    registryExist: true,
    savingRegistry: false,
    selectedRegistry: null,
    noEditingRegistry: true,
  },
  init(){
    this._super(...arguments);
    let value = this.get('value');
    if(value){
      let output = analyzeImageRepo(value);
      this.set('state.imageRegistry', output.registry);
      this.set('state.imageRepo',output.repository);
      this.set('state.imageTag', output.tag);
    }else{
      this.set('state.imageRegistry', 'index.docker.io');
      this.set('state.imageRepo', '');
      this.set('state.imageTag', '');
    }
  },
  observerDockerRegistry: on('init', observer('registries.[]',function(){
    this.set('state.registries', this.get('registries').map(ele=>{
      let registry = Object.keys(ele.registries)[0];
      return {
        label: registry,
        value: registry,
        username: ele.registries[registry].username
      }
    }));
  })),
  observer: observer('state.imageRepo','state.imageTag','state.imageRegistry',function(){
    let state = this.get('state');
    let registryField = this.get('registryField');
    if(!state.imageRepo||!state.imageRegistry){
      this.set('value','');
      return
    }
    let repoName = `${state.imageRepo}`;
    if(state.imageTag){
      repoName += `:${state.imageTag}`;
    }
    if(registryField&&state.imageRegistry!=='index.docker.io'){
      repoName = `${state.imageRegistry}/${repoName}`
    }
    this.set('value',repoName);
  }),
  observerRegistry: on('init', observer('state.imageRegistry','state.registries.[]',function(){
    let state = this.get('state');
    let selectedRegistry = state.registries.find(ele=>state.imageRegistry===ele.value);
    if(selectedRegistry){
      set(this, 'state.selectedRegistry', selectedRegistry);
      this.set('state.registryExist',true);
      this.set('modalState.saveDisabled', false);
    }else{
      this.set('state.registryExist',false);
      this.set('modalState.saveDisabled', true);
    }
  })),
  actions: {
    setState(state, val){
      set(this, `${state}`, val);
      let username = get(this, 'state.selectedRegistry.username');
      if(state === 'state.noEditingRegistry'){
        set(this, 'state.username', val?'':username);
      }
    },
    saveRegistry(){
      let state = this.get('state');
      let noEditing = get(this, 'state.noEditingRegistry');
      this.set('state.savingRegistry', true);
      if(noEditing){
        this.get('store').createRecord({
          type: 'dockerCredential',
          registries: {
            [`${state.imageRegistry}`]: {
              username: state.username,
              password: state.password,
            }
          }
        }).save().finally(()=>{
          this.set('state.savingRegistry', false);
        });
      }else{
        let registries = this.get('registries');
        let selectedRegistry = get(this, 'state.selectedRegistry');
        let selectedOriginRegistry = registries.find(ele => {
          return ele.registries[selectedRegistry.value];
        });
        if(!selectedOriginRegistry){
          return;
        }
        let serilizedRegistry = selectedOriginRegistry.serialize();
        this.get('store').createRecord(
          Object.assign({},serilizedRegistry,{
            registries: {
              [`${state.imageRegistry}`]: {
                username: state.username,
                password: state.password,
              }
            }
          })
        )
        .save().then((/*registry*/)=>{
          let registries = get(this, 'state.registries');
          set(this, 'state.registries', registries.map(ele=>{
            if(ele.value === state.imageRegistry){
              return Object.assign({}, ele, {
                username: state.username
              });
            }
            return ele;
          }))
        }).finally(()=>{
          this.set('state.savingRegistry', false);
          set(this, 'state.noEditingRegistry', true);
        });
      }
    }
  }
});
