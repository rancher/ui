import Mixin from '@ember/object/mixin';
import { computed, setProperties } from '@ember/object';
import { isEmpty } from '@ember/utils';

const NONE = 'none';
const TLS = 'tls';
const STARTTLS = 'starttls';

export default Mixin.create({
  encryption: computed('authConfig.{tls,starttls}', {
    get() {
      const { authConfig } = this;

      if (isEmpty(authConfig)) {
        return NONE;
      } else {
        if (authConfig.tls && !authConfig.starttls) {
          return TLS;
        } else if (!authConfig.tls && authConfig.starttls) {
          return STARTTLS;
        } else {
          return NONE;
        }
      }
    },
    set(key, value) {
      switch (value) {
      case TLS:
        setProperties(this.authConfig, {
          tls:      true,
          starttls: false,
        });
        break;
      case STARTTLS:
        setProperties(this.authConfig, {
          tls:      false,
          starttls: true,
        });
        break;
      default:
        setProperties(this.authConfig, {
          tls:      false,
          starttls: false,
        });
        break;
      }

      return value;
    },
  }),

});
