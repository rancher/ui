import Resource from 'ember-api-store/models/resource';
import { set } from '@ember/object';

var MachineTemplate = Resource.extend({
  type: 'machinetemplate',
  actions: {
  },

  availableActions: function() {
    let l = this.get('links');

    return [
      { label: 'action.remove',     icon: 'icon icon-trash',  action: 'promptDelete', enabled: !!l.remove, altAction: 'delete' },
      { divider: true },
      { label: 'action.viewInApi',  icon: 'icon icon-external-link',action: 'goToApi', enabled: true},
    ];
  }.property('links.{remove}'),
});
MachineTemplate.reopenClass({
  mangleIn: function(data) {
    // @@TODO@@ - 11-29-17 - for demo
    let neuConfig = {
      "availabilitySet": "docker-machine",
      "clientId": "",
      "clientSecret": "",
      "customData": "",
      "dns": "",
      "dockerPort": "2376",
      "environment": "AzurePublicCloud",
      "image": "canonical:UbuntuServer:16.04.0-LTS:latest",
      "location": "westus",
      "privateIpAddress": "",
      "resourceGroup": "docker-machine",
      "size": "Standard_A2",
      "sshUser": "docker-user",
      "storageType": "Standard_LRS",
      "subnet": "docker-machine",
      "subnetPrefix": "192.168.0.0/16",
      "subscriptionId": "",
      "vnet": "docker-machine-vnet",
      "type": "azureConfig",
      "openPort": [
        "500/udp",
        "4500/udp"
      ],
      "staticPublicIp": true,
      "noPublicIp": false,
      "usePrivateIp": false
    };
    set(data, 'publicValues.azureConfig', neuConfig);
    return data;
  },
})

export default MachineTemplate;
