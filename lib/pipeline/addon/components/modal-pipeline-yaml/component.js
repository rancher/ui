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
    get(this, 'model').followLink('yaml')
      .then((yaml) => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        const map = JSON.parse(yaml);

        set(this, 'map', map);

        const branchesChoices = [];

        Object.keys(map).forEach((key) => {
          branchesChoices.push({
            branch:     key,
            config:     map[key],
            stateColor: map[key] ? '' : 'text-muted',
          });
        });

        set(this, 'branchesChoices', branchesChoices.sortBy('label'));

        if ( get(this, 'branchesChoices.length') ) {
          next(() => {
            set(this, 'branch', get(this, 'branchesChoices.firstObject.branch'));
          });
        }

        set(this, 'loading', false);
      });
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

    set(this, 'config', get(this, `map.${ branch }`));
  }),

});