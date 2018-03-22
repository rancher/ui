import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import { next } from '@ember/runloop'
import { get, set } from '@ember/object';
import { NEW_VOLUME, NEW_PVC } from '../form-volumes/component';

export default Component.extend({
  layout,
  modalService: service('modal'),

  tagName: '',

  actions: {
    defineNewVolume() {
      get(this,'modalService').toggleModal('modal-new-volume', {
        model: get(this,'model.volume'),
        callback: (volume) => {
          set(this,'model.volume', volume);
        },
      });
    },

    defineNewPvc() {
      get(this,'modalService').toggleModal('modal-new-pvc', {
        model: get(this,'model.pvc'),
        namespace: get(this, 'namespace'),
        callback: (pvc) => {
          set(this,'model.pvc', pvc);
          if ( !get(this, 'model.volume.name') ) {
            set(this, 'model.volume.name', get(pvc, 'name'));
          }
        },
      });
    },

    remove() {
      this.sendAction('remove');
    }
  },

  didReceiveAttrs() {
    const mode = get(this, 'model.mode');

    if ( mode === NEW_VOLUME ) {
      next(() => {
        this.send('defineNewVolume');
      });
    }  else if ( mode  ===  NEW_PVC ) {
      next(() => {
        this.send('defineNewPvc');
      });
    }
  },

});
