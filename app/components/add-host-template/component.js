import Ember from 'ember';

const HOST_DETAILS = [
  {
    provider:   'Amazon',
    keys:       [
      {
        type:   'accessKey',
        name:   'Access Key',
        public: true
      },
      {
        type:   'secretKey',
        name:   'Secret Key',
      },
    ],
  },
  {
    provider:   'Digital Ocean',
    keys:       [
      {
        type:   'accessToken',
        name:   'Access Token',
      },
    ],
  },
  {
    provider:   'Packet',
    keys:       [
      {
        type:   'projectId',
        name:   'Project ID',
        public: true,
      },
      {
        type:   'apiKey',
        name:   'API Key',
      },
    ],
  },
];
// this component really doesn't care about the host provider
// all its going to do is validate and save so the partial could
// load the template for adding and saving keys
export default Ember.Component.extend({
  add:                false,
  templates:          null,
  selectedKey:        null,
  provider:           null,
  providerKeyDetails: HOST_DETAILS,
  newKeys:            null,
  actions:            {
    addKey() {
      var provider = this.get('providerKeyDetails').findBy('provider', this.get('provider'));
      this.set('newKeys', provider.keys);
      this.set('selectedKey', null);
      this.set('add', true);
    }
  },
  keyObserver: Ember.observer('newKeys.@each.value', function() {
    this.set('selectedTemplateKey', this.get('newKeys'));
  })
});
