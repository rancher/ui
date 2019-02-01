import Component from '@ember/component';
import { get, computed, setProperties } from '@ember/object';

export default Component.extend({
  didUpdateAttrs() {
    const config = get(this, 'config') || {}

    setProperties(config, {
      saslType:           get(config, 'saslType') || 'plain',
      saslScramMechanism: get(config, 'saslScramMechanism') || 'sha256',
    })
  },

  disabled: computed('config.saslUsername', 'config.saslPassword', function() {
    const config = get(this, 'config') || {}
    const { saslUsername, saslPassword } = config

    return saslUsername && saslPassword ? false : true
  }),
});
