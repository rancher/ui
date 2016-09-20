import Ember from 'ember';
import Util from 'ui/utils/util';

const {
  computed,
  keys
} = Ember;

const {
  constructUrl
} = Util;

const iconUrl = 'https://upload.wikimedia.org/wikipedia/commons/a/a6/AWS_Simple_Icons_Deployment_Management_AWS_CloudFormation_Stack.svg';

export default Ember.Component.extend({
  iconUrl,

  publicLink: computed('model.services.firstObject.endpointsMap', function(){
    let services = this.get('model.services').filterBy('publicEndpoints');
    let endpoints = services.get('firstObject.endpointsMap') || {};
    let ports = Object.keys(endpoints);
    if (ports.length > 0) {
      let [ port ] = ports;
      let ips = endpoints[port];
      let [ip] = ips;
      return constructUrl(false, ip, port);
    }

  })

});
