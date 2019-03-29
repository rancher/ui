import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import { next } from '@ember/runloop'
import { get, set, computed } from '@ember/object';
import { NEW_VOLUME, NEW_PVC, NEW_VCT } from '../form-volumes/component';

export default Component.extend({
  modalService: service('modal'),

  layout,
  tagName:  '',
  editing:  true,
  pvcs:     null,
  workload: null,

  init() {
    this._super(...arguments);
    set(this, 'pvcs', get(this, 'store').all('persistentVolumeClaim'));
  },

  didReceiveAttrs() {
    const mode = get(this, 'model.mode');

    if ( mode === NEW_VOLUME ) {
      next(() => {
        this.send('defineNewVolume');
      });
    }  else if ( mode === NEW_VCT ) {
      next(() => {
        this.send('defineNewVct');
      });
    } else if ( mode  ===  NEW_PVC ) {
      next(() => {
        this.send('defineNewPvc');
      });
    }
  },

  actions: {
    defineNewVolume() {
      get(this, 'modalService').toggleModal('modal-new-volume', {
        model:    get(this, 'model.volume').clone(),
        callback: (volume) => {
          set(this, 'model.volume', volume);
        },
      });
    },

    defineNewPvc() {
      get(this, 'modalService').toggleModal('modal-new-pvc', {
        model:     get(this, 'model.pvc'),
        namespace: get(this, 'namespace'),
        callback:  (pvc) => {
          set(this, 'model.pvc', pvc);
          if ( !get(this, 'model.volume.name') ) {
            set(this, 'model.volume.name', get(pvc, 'name'));
          }
        },
      });
    },

    defineNewVct() {
      const { modalService } = this;

      modalService.toggleModal('modal-new-vct', {
        model:     get(this, 'model.vct'),
        namespace: get(this, 'namespace'),
        callback:  (vct) => {
          set(this, 'model.vct', vct);

          if ( !get(this, 'model.name') ) {
            set(this, 'model.name', get(vct, 'name'));
          }
        },
      });
    },

    remove() {
      if (this.remove) {
        this.remove(this.model);
      }
    },

    addMount() {
      const mount = get(this, 'store').createRecord({ type: 'volumeMount', })

      get(this, 'model.mounts').pushObject(mount);
    },

    removeMount(mount) {
      get(this, 'model.mounts').removeObject(mount);
    },
  },

  pvcChoices: computed('pvcs.@each.{name,state}', 'namespace.id', function() {
    return get(this, 'pvcs').filterBy('namespaceId', get(this, 'namespace.id'))
      .map((v) => {
        let label = get(v, 'displayName');
        const state = get(v, 'state');
        const disabled = false;

        if ( disabled ) {
          label += ` (${  state  })`;
        }

        return {
          label,
          disabled,
          value: get(v, 'id'),
        }
      })
      .sortBy('label');
  }),

});
