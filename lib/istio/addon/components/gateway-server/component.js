import Component from '@ember/component';
import layout from './template';
import { get, set } from '@ember/object'

const TLS_OPTIONS = [
  {
    label: 'PASSTHROUGH',
    value: 'PASSTHROUGH'
  },
  {
    label: 'SIMPLE',
    value: 'SIMPLE'
  },
  {
    label: 'MUTUAL',
    value: 'MUTUAL'
  },
  {
    label: 'AUTO_PASSTHROUGH',
    value: 'AUTO_PASSTHROUGH'
  },
  {
    label: 'ISTIO_MUTUAL',
    value: 'ISTIO_MUTUAL'
  },
];

const PROTOCOLS = [
  {
    label: 'HTTP',
    value: 'HTTP'
  },
  {
    label: 'HTTPS',
    value: 'HTTPS'
  },
  {
    label: 'GRPC',
    value: 'GRPC'
  },
  {
    label: 'HTTP2',
    value: 'HTTP2'
  },
  {
    label: 'MONGO',
    value: 'MONGO'
  },
  {
    label: 'TCP',
    value: 'TCP'
  },
  {
    label: 'TLS',
    value: 'TLS'
  },
];

export default Component.extend({
  layout,

  editing:   true,
  server:    null,

  protocols:  PROTOCOLS,
  tlsOptions: TLS_OPTIONS,

  init() {
    this._super(...arguments);
    this.initTls();
  },

  actions: {
    removeServer(server) {
      if ( this.removeServer ) {
        this.removeServer(server);
      }
    },

    setHosts(hosts) {
      set(this, 'server.hosts', hosts);
    },

    setSubjectAltNames(subjectAltNames) {
      set(this, 'server.tls.subjectAltNames', subjectAltNames);
    }
  },

  initTls() {
    if ( !get(this, 'server.tls') && get(this, 'editing') ) {
      set(this, 'server.tls', { httpsRedirect: false, });
    }
  }
});
