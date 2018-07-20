import Component from '@ember/component';
import { on } from '@ember/object/evented';
import { observer } from '@ember/object';
import { analyzeImageRepo } from 'pipeline/utils/pipelineStep';
import layout from './template';
import { inject as service } from '@ember/service';
import { set, get } from '@ember/object';

export default Component.extend({
  store:         service(),
  layout,
  registryField: false,
  value:         '',
  registries:    '',
  state:         {
    registries:        [],
    imageRegistry:     '',
    imageRepo:         '',
    imageTag:          '',
    registryExist:     true,
    savingRegistry:    false,
    selectedRegistry:  null,
    noEditingRegistry: true,
  },
  init(){
    this._super(...arguments);
    let value = get(this, 'value');

    if (value){
      let output = analyzeImageRepo(value);

      set(this, 'state.imageRegistry', output.registry);
      set(this, 'state.imageRepo', output.repository);
      set(this, 'state.imageTag', output.tag);
    } else {
      set(this, 'state.imageRegistry', 'index.docker.io');
      set(this, 'state.imageRepo', '');
      set(this, 'state.imageTag', '');
    }
  },
  actions: {
    setState(state, val){
      set(this, `${ state }`, val);
      let username = get(this, 'state.selectedRegistry.username');

      if (state === 'state.noEditingRegistry'){
        set(this, 'state.username', val ? '' : username);
      }
    },
    saveRegistry(){
      let state = get(this, 'state');
      let noEditing = get(this, 'state.noEditingRegistry');

      set(this, 'state.savingRegistry', true);
      if (noEditing){
        get(this, 'store').createRecord({
          type:       'dockerCredential',
          registries: {
            [`${ state.imageRegistry }`]: {
              username: state.username,
              password: state.password,
            }
          }
        }).save().finally(() => {
          set(this, 'state.savingRegistry', false);
        });
      } else {
        let registries = get(this, 'registries');
        let selectedRegistry = get(this, 'state.selectedRegistry');
        let selectedOriginRegistry = registries.find((ele) => {
          return ele.registries[selectedRegistry.value];
        });

        if (!selectedOriginRegistry){
          return;
        }
        let serilizedRegistry = selectedOriginRegistry.serialize();

        get(this, 'store').createRecord(
          Object.assign({}, serilizedRegistry, {
            registries: {
              [`${ state.imageRegistry }`]: {
                username: state.username,
                password: state.password,
              }
            }
          })
        )
          .save().then((/* registry*/) => {
            let registries = get(this, 'state.registries');

            set(this, 'state.registries', registries.map((ele) => {
              if (ele.value === state.imageRegistry){
                return Object.assign({}, ele, { username: state.username });
              }

              return ele;
            }))
          })
          .finally(() => {
            set(this, 'state.savingRegistry', false);
            set(this, 'state.noEditingRegistry', true);
          });
      }
    }
  },
  observer: observer('state.imageRepo', 'state.imageTag', 'state.imageRegistry', function(){
    let state = get(this, 'state');
    let registryField = get(this, 'registryField');

    if (!state.imageRepo || !state.imageRegistry){
      set(this, 'value', '');

      return
    }
    let repoName = `${ state.imageRepo }`;

    if (state.imageTag){
      repoName += `:${ state.imageTag }`;
    }
    if (registryField && state.imageRegistry !== 'index.docker.io'){
      repoName = `${ state.imageRegistry }/${ repoName }`
    }
    set(this, 'value', repoName);
  }),
  width:         function(){
    let registryFiled = get(this, 'registryField');

    if (registryFiled){
      return '30%';
    }

    return '48%';
  }.property('registryFiled'),
  observerDockerRegistry: on('init', observer('registries.[]', function(){
    set(this, 'state.registries', get(this, 'registries').map((ele) => {
      let registry = Object.keys(ele.registries)[0];

      return {
        label:    registry,
        value:    registry,
        username: ele.registries[registry].username
      }
    }));
  })),
  observerRegistry: on('init', observer('state.imageRegistry', 'state.registries.[]', function(){
    let state = get(this, 'state');
    let selectedRegistry = state.registries.find((ele) => state.imageRegistry === ele.value);

    if (selectedRegistry){
      set(this, 'state.selectedRegistry', selectedRegistry);
      set(this, 'state.registryExist', true);
      set(this, 'modalState.saveDisabled', false);
    } else {
      set(this, 'state.registryExist', false);
      set(this, 'modalState.saveDisabled', true);
    }
  })),
});
