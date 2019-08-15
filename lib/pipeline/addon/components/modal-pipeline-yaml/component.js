import Component from '@ember/component';
import { next } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { set, get, observer } from '@ember/object';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['large-modal', 'alert'],

  branch:          null,
  branchesChoices: null,
  loading:         false,
  errors:          null,

  config: null,

  model: alias('modalService.modalOpts.originalModel'),

  init() {
    this._super(...arguments);

    set(this, 'loading', true);
    get(this, 'model').followLink('branches').then((res) => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      const branchesChoices = JSON.parse(res).map((branch) => {
        return { branch }
      }).sortBy('branch');

      set(this, 'branchesChoices', branchesChoices);

      if ( get(this, 'branchesChoices.length') ) {
        next(() => {
          set(this, 'branch', get(this, 'branchesChoices.firstObject.branch'));
        });
      }
    })
  },

  actions: {
    save(success) {
      get(this, 'store').request({
        data:   get(this, 'config'),
        url:    `${ get(this, 'model.links.yaml') }?branch=${ get(this, 'branch') }`,
        method: 'PUT'
      })
        .then(() => {
          this.send('cancel');
        })
        .catch((err) => {
          set(this, 'errors', [err.message]);
          success(false);
        });
    }
  },

  branchDidChange: observer('branch', function() {
    const branch = get(this, 'branch');

    if ( branch ) {
      set(this, 'loading', true);
      get(this, 'model').followLink('yaml', { filter: { branch } }).then((res) => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        set(this, 'config', res);
      }).finally(() => set(this, 'loading', false));
    }
  }),

});
