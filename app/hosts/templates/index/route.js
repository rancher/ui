import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Route.extend({
  beforeModel() {
    return this.get('userStore').findAll('machineDriver').then((drivers) => {
      let acd = drivers.filter((driver) => {
        if (C.ACTIVEISH_STATES.indexOf(driver.get('state')) >= 0) {
          return true;
        }
        return false;
      });

      if (acd.get('length')) {
        return Ember.RSVP.resolve();
      } else {
        this.transitionTo('custom-host');
      }
    });
  },
  model(/* params */) {

    return this.get('store').findAll('hostTemplate').then((templates) => {
      if ( templates.get('length') ) {
        return templates;
      } else {
        this.transitionTo('hosts.new');
      }

    });

  }
});
