import Ember from 'ember';
import Plans from 'ui/utils/plans';

export default Ember.Service.extend({
  _plans: Plans,
  plans: null,
  realms: null,
  hostDetails: null,
});
