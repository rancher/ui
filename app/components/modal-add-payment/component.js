import Ember from 'ember';
import ModalBase from 'ui/mixins/modal-base';
import fetch from 'ember-api-store/utils/fetch';
import C from 'ui/utils/constants';

const CURRENCIES = [
  {
    value: 'utility-cny',
    label: 'modalAddPayment.currencies.yuan',
  },
  {
    value: 'utility-eur',
    label: 'modalAddPayment.currencies.euro',
  },
  {
    value: 'utility-usd',
    label: 'modalAddPayment.currencies.dollar',
  },
];

export default Ember.Component.extend(ModalBase, {
  intl: Ember.inject.service(),
  session: Ember.inject.service(),
  account: Ember.computed.alias(`session.${C.SESSION.ACCOUNT_ID}`),
  classNames: ['generic', 'medium-modal', 'add-new-payment'],
  creditCard: null,
  errors: null,
  selectedCurrency: 'utility-usd',
  currencies: CURRENCIES,
  // customer: null,
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
      var card = this.get('creditCard');
      // var customer = this.get('customer');
      var errors = [];
      var intl = this.get('intl');

      this.set('errors', errors);

      if (!Stripe.card.validateCardNumber(card.number)) {
        errors.push(intl.t('modalAddPayment.errors.cc'));
      }
      if (!Stripe.card.validateExpiry(card.expiry)) {
        errors.push(intl.t('modalAddPayment.errors.exp'));
      }
      if (!Stripe.card.validateCVC(card.cvc)) {
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
        this.send('getToken');
      }
    },
    getToken() {
      this.set('loading', true);
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
      Stripe.card.createToken(cardOut, (status, response) => {
        if (status === 200) {
          // you get access to your newly created token here
          cardOut.token = response.id;
          this.createCustomer(cardOut);
          // post to our server
        } else {

        }
      });
    }
  },

  createCustomer(card) {
    var bodyOut = {
      card: card,
      subscription: {id: this.get('selectedCurrency')},
      account: {id: this.get('account')}
    }
    fetch('/customer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyOut),
    }).then(() => {
      this.set('loading', false);
    }).catch(() => {
      this.set('errMsg', this.get('intl').t('caasLogin.error'));
      this.set('loading', false);
    });
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
