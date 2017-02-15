import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';

export default Ember.Component.extend(ModalBase, {
  stripe: Ember.inject.service(),
  intl: Ember.inject.service(),
  classNames: ['generic', 'medium-modal', 'add-new-payment'],
  creditCard: null,
  errors: null,
  // customer: null,
  suToken: null,
  init() {
    this._super(...arguments);
    this.set('creditCard', {
      name: null,
      number: null,
      expiry: null,
      cvc: null,
    });
    // this.set('customer', {
    //   name: null,
    //   address_line1: null,
    //   address_line2: null,
    //   address_city: null,
    //   address_state: null,
    //   address_zip: null,
    //   address_country: null,
    // });
  },
  actions: {
    validate() {
      // stripe card validate
      var stripe = this.get('stripe');
      var card = this.get('creditCard');
      // var customer = this.get('customer');
      var errors = [];
      var intl = this.get('intl');

      this.set('errors', errors);

      if (!stripe.card.validateCardNumber(card.number)) {
        errors.push(intl.t('modalAddPayment.errors.cc'));
      }
      if (!stripe.card.validateExpiry(card.expiry)) {
        errors.push(intl.t('modalAddPayment.errors.exp'));
      }
      if (!stripe.card.validateCVC(card.cvc)) {
        errors.push(intl.t('modalAddPayment.errors.cvc'));
      }

      // if ( (customer.address_line1||'').trim().length === 0 )
      // {
      //   errors.push(intl.t('modalAddPayment.errors.street'));
      // }

      // if ( (customer.address_city||'').trim().length === 0 )
      // {
      //   errors.push(intl.t('modalAddPayment.errors.city'));
      // }

      // if ( (customer.address_state||'').trim().length === 0 )
      // {
      //   errors.push(intl.t('modalAddPayment.errors.state'));
      // }
      // if ( (customer.address_zip||'').trim().length === 0 )
      // {
      //   errors.push(intl.t('modalAddPayment.errors.zip'));
      // }

      if (errors.length) {
        this.set('errors', errors);
      } else {
        this.send('createCustomer');
      }
    },
    createCustomer() {
      var stripe = this.get('stripe');
      var card = this.get('creditCard');
      // var customer = this.get('customer');
      var cardOut = {};

      // card.js returns the expiry in a single string, stripe expects the expiry in two (month and year)
      Object.keys(card).forEach((key) => {
        if (key !== 'expiry') {
          cardOut[key] = card[key];
        } else {
          let date = card[key].split('/');
          cardOut['exp_month'] = date[0].trim();
          cardOut['exp_year'] = date[1].trim();
        }
      });

      // this.$().extend(cardOut, customer);
      stripe.card.createToken(cardOut).then((response) => {
        // you get access to your newly created token here
        cardOut.token = response.id;
      }).then(() => {
        // post to our server
      }).catch((response) => {
        // if there was an error retrieving the token you could get it here

        if (response.error.type === 'card_error') {
          // show the error in the form or something
        }
      });
    }
  },
  canValidate: Ember.computed('creditCard.name', 'creditCard.number', 'creditCard.expiry', 'creditCard.cvc', function() {
    var out = false;
    var cc = this.get('creditCard');
    if (cc.name && cc.number && cc.cvc && cc.expiry) {
      out = true;
    } else {
      out = false;
    }
    return out;
  }),
});
