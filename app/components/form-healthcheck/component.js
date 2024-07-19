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

  editing: true,

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

    const initial = this.initialCheck;
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
        const originalHeaders = get(check, 'httpHeaders') || [];
        let host = null;
        const headers = {};

        originalHeaders.forEach((h) => {
          const name = (get(h, 'name') || '');
          const value = (get(h, 'value') || '');

          if ( name.toLowerCase() === 'host' ) {
            host = value;
          } else {
            set(headers, name, value);
          }
        });

        set(this, 'path', get(check, 'path'));
        set(this, 'host', host);
        set(this, 'headers', headers);
      }
    } else {
      check = this.store.createRecord({
        type:                'probe',
        failureThreshold:    3,
        initialDelaySeconds: 10,
        path:                '/',
        periodSeconds:       2,
        successThreshold:    2,
        timeoutSeconds:      2,
      });
    }

    if ( this.successMustBeOne ) {
      set(check, 'successThreshold', 1);
    }

    set(this, 'healthCheck', check);
    set(this, 'checkType', type);
    this.validate();

    scheduleOnce('afterRender', this, 'checkChanged');
  },

  checkChanged: observer('path', 'host', 'headers', 'checkType', 'command', function() {
    const check = this.healthCheck;

    if ( this.isNone ) {
      if (this.changed) {
        this.changed(null);
      }

      return;
    }

    setProperties(check, { tcp: this.isTcp });

    if ( this.isHttpish ) {
      const host = this.host;
      const httpHeaders = [];

      if ( host ) {
        httpHeaders.push({
          name:  'Host',
          value: host
        })
      }

      const headers = this.headers || {};

      Object.keys(headers).forEach((header) => {
        httpHeaders.push({
          name:  header,
          value: get(headers, header)
        })
      })

      setProperties(check, {
        httpHeaders,
        path:        this.path || '/',
        scheme:      this.isHttps ? 'HTTPS' : 'HTTP'
      });
    } else {
      setProperties(check, {
        path:        null,
        httpHeaders: null,
      });
    }

    if ( this.isCommand ) {
      set(check, 'command', this.command );
    } else {
      set(check, 'command', null);
    }

    if (this.changed) {
      this.changed(check);
    }
  }),

  validate: observer('isNone', 'isCommand', 'healthCheck.command.[]', 'healthCheck.port', function() {
    var errors = [];

    set(this, 'errors', errors);

    if ( this.isNone ) {
      return;
    }

    if ( this.isCommand ) {
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
