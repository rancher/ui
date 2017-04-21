import Ember from 'ember';
const { get } = Ember;

function normalizeUIOptions(options) {
  options.forEach((opt) => {
    let neu = {};
    Object.keys(get(opt, 'ui_options')).forEach((key) => {
      neu[key.camelize()] = get(opt, 'ui_options')[key];
    });
    opt.uiOptions = neu;
    delete opt.ui_options;
  });
  return options;
}

export function initialize(instance) {
  var PS = instance.lookup('service:cloud-plans');
  var plans = JSON.parse(get(PS, '_plans.realms'));
  plans = normalizeUIOptions(plans);
  PS.setProperties({
    plans: plans,
    realms: get(PS, '_plans.realmNames'),
    hostDetails: get(PS, '_plans.realmNames')
  });
}

export default {
  name: 'cloudPlans',
  initialize: initialize
};
