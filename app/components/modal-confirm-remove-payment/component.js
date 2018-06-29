import { alias } from '@ember/object/computed';
import Component from '@ember/component';
import ModalBase from 'shared/mixins/modal-base';
import fetch from 'ember-api-store/utils/fetch';
import layout from './template';

export default Component.extend(ModalBase, {
  layout,
  classNames: ['generic', 'medium-modal', 'add-new-payment'],
  card:       alias('modalService.modalOpts.card'),
  account:    alias('modalService.modalOpts.account'),
  actions:    {
    confirm() {

      this.set('loading', true);
      fetch('/payment', {
        method:  'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          customerId: JSON.parse(this.get('account.description')).stripeAccountId,
          cardId:     this.get('card.id')
        }),
      }).then(() => {

        this.set('loading', false);

        window.location.reload(); // need to update this to send the action all the way back up and fetch the subs
        // this.send('cancel');

      })
        .catch(() => {

          this.set('errMsg', this.get('intl').t('caasLogin.error'));
          this.set('loading', false);

        });

    },
  }
});
