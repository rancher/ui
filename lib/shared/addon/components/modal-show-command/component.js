import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import layout from './template';
import { alias, equal } from '@ember/object/computed';
import { set, observer } from '@ember/object';
import { inject as service } from '@ember/service';
import { later } from '@ember/runloop';

export default Component.extend(ModalBase, {
  intl: service(),

  layout,

  classNames: ['modal-container', 'large-modal', 'fullscreen-modal'],

  loading:     false,
  showSuccess: false,
  tokenErrors: null,

  cluster:         alias('modalOpts.cluster'),
  clusterProvider: alias('cluster.clusterProvider'),
  canShowAddHost:  alias('cluster.canShowAddHost'),

  isImport: equal('clusterProvider', 'import'),
  isCustom: equal('clusterProvider', 'custom'),

  init() {
    this._super(...arguments);
    this.shortcuts.disable();

    set(this, 'tokenErrors', []);

    this.loadToken();
    this.shouldDismissModal();
  },

  shouldDismissModal: observer('canShowAddHost', function() {
    if ( this.isDestroyed || this.isDestroying ) {
      return;
    }

    const { canShowAddHost } = this;

    if (!canShowAddHost) {
      set(this, 'showSuccess', true);

      later(this, () => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.send('close');
      }, 3000);
    }
  }),

  async loadToken() {
    const { cluster } = this;

    set(this, 'loading', true);

    try {
      const token = await cluster.getOrCreateToken();

      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      if (token) {
        set(this, 'token', token);
      }
    } catch (err) {
      const errMsg = this.intl.t('modalShowCommand.errors.token', { err: err.message || 'Unknown' });

      set(this, 'tokenErrors', [errMsg]);
    }


    set(this, 'loading', false);
  },

  willDestroy() {
    this._super(...arguments);
    this.shortcuts.enable();
  }
});
