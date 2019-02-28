import Component from '@ember/component';
import { computed } from '@ember/object';
import { alias, equal } from '@ember/object/computed'

export default Component.extend({
  disabled: null,

  sslVersionContent: [{
    label: 'SSLv23',
    value: 'SSLv23',
  }, {
    label: 'TLSv1',
    value: 'TLSv1',
  }, {
    label: 'TLSv1_1',
    value: 'TLSv1_1',
  }, {
    label: 'TLSv1_2',
    value: 'TLSv1_2',
  }],

  sslVerify: alias('config.sslVerify'),
  isUdp:     equal('config.protocol', 'udp'),

  clipboardText: computed('clientKeyPath', 'clientCertPath', 'certificatePath', function() {
    const {
      clientKeyPath, clientCertPath, certificatePath
    } = this;
    let out = '';
    const arr = [clientKeyPath, clientCertPath, certificatePath].filter((ca) => ca);

    arr.map((ca, index) => {
      if (index === arr.length - 1) {
        out += `${ ca }`;
      } else {
        out += `${ ca }
`;
      }
    });

    return out;
  }),

});
