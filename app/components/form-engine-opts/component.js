import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  machine: null,
  settings: Ember.inject.service(),
  showEngineUrl: null,

  didReceiveAttrs() {
    if ( this.get('machine.engineInstallUrl') === undefined && this.get('showEngineUrl') )
    {
      this.set('machine.engineInstallUrl', this.get(`settings.${C.SETTING.ENGINE_URL}`) || '');
    }
  },
});
