import { equal, or } from '@ember/object/computed';
import { observer, get, set, setProperties } from '@ember/object';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from './template';

const NONE = 'none';
const TCP = 'tcp';
const HTTP = 'http';
const HTTPS = 'https';
const COMMAND = 'command';

export default Component.extend({
  layout,
  scope: service(),
  intl: service(),
  settings: service(),

  // Inputs
  healthCheck: null,
  errors: null,
  dnsNote: false,

  editing: true,

  isNone: equal('checkType', NONE),
  isTcp: equal('checkType', TCP),
  isHttp: equal('checkType', HTTP),
  isHttps: equal('checkType', HTTPS),
  isHttpish: or('isHttp','isHttps'),
  isCommand: equal('checkType', COMMAND),

  checkType: null,
  command: null,
  path: null,
  host: null,
  headers: null,

  init() {
    this._super(...arguments);

    const initial = get(this, 'initialCheck');
    let check;
    let type = NONE;
    if ( initial ) {
      check = initial.clone();
      type = get(check, 'kind') || NONE;

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
      check = get(this,'store').createRecord({
        type: 'probe',
        kind: 'none',
        initialDelaySeconds: 10,
        periodSeconds: 2,
        failureTheshold: 3,
        successThreshold: 2,
        timeoutSeconds: 2,
        path: '/'
      });
    }

    set(this, 'healthCheck', check);
    set(this, 'checkType', type);
    this.validate();
  },

  checkChanged: observer('path','host','headers','checkType','command', function() {
    const check = get(this, 'healthCheck');

    if ( get(this, 'isNone') ) {
      this.sendAction('changed', null);
      return;
    }

    if ( get(this, 'isHttpish') ) {
      const host = get(this,'host');
      const hostHeader = {};
      if ( host ) {
        hostHeader['Host'] = host;
      }

      const headers = Object.assign({}, hostHeader, get(this,'headers'));
      setProperties(check, {
        httpHeaders: headers,
        path: get(this,'path') || '/'
      });
    } else {
      setProperties(check, {
        path: null,
        httpHeaders: null,
      });
    }

    if ( get(this, 'isCommand') ) {
      set(check,'command', get(this,'command') );
    } else {
      set(check,'command',null);
    }

    set(check,'kind', get(this, 'checkType'));

    this.sendAction('changed', check);
  }),

  validate: function() {
    var errors = [];
    this.set('errors', errors);

    if ( get(this,'isNone') ) {
      return;
    }

    if ( get(this, 'isCommand') ) {
      if ( !this.get('healthCheck.command.length') ) {
        errors.push('Health Check command is required');
      }
    } else {
      if ( !this.get('healthCheck.port') ) {
        errors.push('Health Check port is required');
      }
    }
  }.observes('isNone','isCommand','healthCheck.port'), // @TODO-2.0
});
