import { helper } from '@ember/component/helper';

// this list matchse the card types that stripe uses
const CARDS = {
  'Visa':             'card-visa',
  'American Express': 'card-amex',
  'MasterCard':       'card-mastercard',
  'Discover':         'card-discover',
  'Diners Club':      'card-diners',
  'JCB':              'card-jcb'
};

export function getCardClass(key/* , hash*/) {
  return CARDS[key];
}

export default helper(getCardClass);
