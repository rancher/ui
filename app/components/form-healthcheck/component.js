import { equal, or } from '@ember/object/computed';
import { observer, get, set, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';
import { scheduleOnce } from '@ember/runloop';

const NONE = 'none';
const TCP = 'tcp';
const HTTP = 'http';
const HTTPS = 'https';
const COMMAND = 'command';

export default Component.extend({
  scope:            service(),
  intl:             service(),
  settings:         service(),

  layout,
  // Inputs
  healthCheck:      null,
  errors:           null,
  dnsNote:          false,
  successMustBeOne: false,
  isLiveness:       false,

  editing:          true,

  checkType:        null,
  command:          null,
  path:             null,
  host:             null,
  headers:          null,

  isNone:           equal('checkType', NONE),
  isTcp:            equal('checkType', TCP),
  isHttp:           equal('checkType', HTTP),
  isHttps:          equal('checkType', HTTPS),
  isHttpish:        or('isHttp', 'isHttps'),
  isCommand:        equal('checkType', COMMAND),

  init() {
    this._super(...arguments);

    const initial = get(this, 'initialCheck');
    let check;
    let type = NONE;

    if ( initial ) {
      check = Object.assign({}, initial);
      if ( get(check, 'tcp') ) {
        type = TCP;
      } else if ( get(check, 'command.length') ) {
        type = COMMAND;
        set(this, 'command', get(check, 'command'));
      } else if ( get(check, 'scheme') === 'HTTP' ) {
        type = HTTP;
      } else if ( get(check, 'scheme') === 'HTTPS' ) {
        type = HTTPS;
      }

      if ( type === HTTP || type === HTTPS ) {
        const originalHeaders = get(check, 'httpHeaders') || {};
        let host = null;
        const headers = {};

        Object.keys(originalHeaders).forEach((key) => {
          if ( key.toLowerCase() === 'host' ) {
            host = originalHeaders[key];
          } else {
            headers[key] = originalHeaders[key];
          }
        });

        set(this, 'path', get(check, 'path'));
        set(this, 'host', host);
        set(this, 'headers', headers);
      }
    } else {
      check = get(this, 'store').createRecord({
        type:                'probe',
        failureThreshold:    3,
        initialDelaySeconds: 10,
        path:                '/',
        periodSeconds:       2,
        successThreshold:    2,
        timeoutSeconds:      2,
      });
    }

    if ( get(this, 'successMustBeOne') ) {
      set(check, 'successThreshold', 1);
    }

    set(this, 'healthCheck', check);
    set(this, 'checkType', type);
    this.validate();

    scheduleOnce('afterRender', () => {
      this.checkChanged()
    });
  },

  checkChanged: observer('path', 'host', 'headers', 'checkType', 'command', function() {
    const check = get(this, 'healthCheck');

    if ( get(this, 'isNone') ) {
      this.sendAction('changed', null);

      return;
    }

    setProperties(check, { tcp: get(this, 'isTcp') });

    if ( get(this, 'isHttpish') ) {
      const host = get(this, 'host');
      const hostHeader = {};

      if ( host ) {
        hostHeader['Host'] = host;
      }

      const headers = Object.assign({}, hostHeader, get(this, 'headers'));

      setProperties(check, {
        httpHeaders: headers,
        path:        get(this, 'path') || '/',
        scheme:      get(this, 'isHttps') ? 'HTTPS' : 'HTTP'
      });
    } else {
      setProperties(check, {
        path:        null,
        httpHeaders: null,
      });
    }

    if ( get(this, 'isCommand') ) {
      set(check, 'command', get(this, 'command') );
    } else {
      set(check, 'command', null);
    }

    this.sendAction('changed', check);
  }),

  validate: observer('isNone', 'isCommand', 'healthCheck.command.[]', 'healthCheck.port', function() {
    var errors = [];

    set(this, 'errors', errors);

    if ( get(this, 'isNone') ) {
      return;
    }

    if ( get(this, 'isCommand') ) {
      if ( !get(this, 'healthCheck.command.length') ) {
        errors.push('Health Check command is required');
      }
    } else {
      if ( !get(this, 'healthCheck.port') ) {
        errors.push('Health Check port is required');
      }
    }
  }),
});
