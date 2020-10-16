import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { isSafari } from 'ui/utils/platform';
import layout from './template';
import { next } from '@ember/runloop';
import { get, set, observer, computed } from '@ember/object';
import ThrottledResize from 'shared/mixins/throttled-resize';
import { alias } from '@ember/object/computed'
import C from 'ui/utils/constants';
import $ from 'jquery';
import Parse from 'logging/mixins/parse-fluentd-file';

const DATE_FORMAT = {
  'YYYY-MM-DD': '%Y-%m-%d',
  'YYYY-MM':    '%Y-%m',
  'YYYY':       '%Y',
}

export default Component.extend(ThrottledResize, Parse, {
  settings:         service(),
  growl:            service(),
  scope:            service(),

  layout,
  mode:             'text',
  label:            null,
  namePlaceholder:  '',
  nameRequired:     false,
  name:             null,
  value:            null,
  placeholder:      '',
  accept:           'text/*, .yml, .yaml',
  multiple:         false,
  viewportMargin:   Infinity,
  autoResize:       false,
  resizeFooter:     130,
  minHeight:        50,
  inputName:        false,
  canChangeName:    true,
  canUpload:        true,
  showUploadLabel:  true,
  gutters:          ['CodeMirror-lint-markers'],
  tagName:          ['div'],
  showUpload:       true,
  showDownload:     true,
  deepStr:          null,

  config: alias('model.config'),

  init() {
    this._super(...arguments);
    this.customTypeObserver()
  },

  actions: {
    click() {
      $(this.element).find('INPUT[type=file]').click();
    },

    updateValue(value) {
      next(() => {
        set(this, 'value', value)
      })
    },
  },

  loadingDidChange: observer('loading', function() {
    if ( !get(this, 'loading') && get(this, 'autoResize') ) {
      next(() => {
        this.fit();
      });
    }
  }),

  customTypeObserver: observer('value', function() {
    next(() => {
      const value = get(this, 'value')
      const { fileObj } = this.parseValue(value)

      const type = fileObj['@type']
      const out = C.LOGGING_TPYE_TO_CONFIG[type]

      set(this, 'customType', out)
    })
  }),

  customTypeChange: observer('customType', function() {
    this.formatValue()
  }),

  caChange: observer('clientKeyPath', 'clientCertPath', 'certificatePath', function() {
    this.formatValue()
  }),

  actualAccept: computed('accept', function() {
    if ( isSafari ) {
      return '';
    } else {
      return get(this, 'accept');
    }
  }),

  logPreview: computed('fieldsStr', function() {
    const fieldsStr = get(this, 'fieldsStr');
    const template = `{
    "log":    "time=\"${ new Date().toString() }\" level=info msg=\"Cluster [local] condition status unknown\"",
    "stream": "stderr",
    "tag":    "default.var.log.containers.cattle-6b4ccb5b9d-v57vw_default_cattle-xxx.log"
    "docker": {
        "container_id": "xxx"
    },
    "kubernetes": {
        "container_name": "cattle",
        "namespace_name": "default",
        "pod_name":       "cattle-6b4ccb5b9d-v57vw",
        "pod_id":         "30c685d0-fa43-11e7-b992-00163e016dc2",
        "labels":         {
            "app": "cattle",
            "pod-template-hash": "2607761658"
        },
        "host":       "47.52.113.251",
        "master_url": "https://10.233.0.1:443/api"
    },
${ fieldsStr }
  ...
}`;

    return template
  }),

  fieldsStr: computed('model.outputTags', function() {
    const keyValueMap = get(this, 'model.outputTags')

    if (!keyValueMap) {
      return '';
    }

    return Object.keys(keyValueMap).map((key) => `    "${ key }": "${ keyValueMap[key] }"`).join(',\n');
  }),

  clientKeyPath: computed('config.clientKey', 'customType', 'pageScope', 'scope.currentCluster.id', 'scope.currentProject.id', function() {
    const pageScope = get(this, 'pageScope')
    const customType = get(this, 'customType')
    let name

    if (get(this, 'config.clientKey')) {
      if (pageScope === 'cluster') {
        name = get(this, 'scope.currentCluster.id')
      } else {
        const projectId = get(this, 'scope.currentProject.id') || ''

        name = `${ get(this, 'scope.currentCluster.id') }_${ projectId.split(':')[1] }`
      }

      let key = `client_key`

      switch (customType) {
      case 'kafka':
        key = `ssl_client_cert_key`
        break;
      case 'syslog':
        key = `client_cert_key`
        break;
      case 'fluentForwarder':
        key = `tls_client_private_key_path`
        break;
      }

      return `${ key } /fluentd/etc/config/ssl/${ pageScope }_${ name }_client-key.pem`
    }

    return null;
  }),

  clientCertPath: computed('config.clientCert', 'customType', 'pageScope', 'scope.currentCluster.id', 'scope.currentProject.id', function() {
    const pageScope = get(this, 'pageScope')
    const customType = get(this, 'customType')
    let name

    if (get(this, 'config.clientCert')) {
      if (pageScope === 'cluster') {
        name = get(this, 'scope.currentCluster.id')
      } else {
        const projectId = get(this, 'scope.currentProject.id') || ''

        name = `${ get(this, 'scope.currentCluster.id') }_${ projectId.split(':')[1] }`
      }

      let key = `client_cert`

      switch (customType) {
      case 'kafka':
        key = `ssl_client_cert`
        break;
      case 'fluentForwarder':
        key = `tls_client_cert_path`
        break;
      }

      return `${ key } /fluentd/etc/config/ssl/${ pageScope }_${ name }_client-cert.pem`
    }

    return null;
  }),

  certificatePath: computed('config.certificate', 'customType', 'pageScope', 'scope.currentCluster.id', 'scope.currentProject.id', function() {
    const pageScope = get(this, 'pageScope')
    const customType = get(this, 'customType')
    let name

    if (get(this, 'config.certificate')) {
      if (pageScope === 'cluster') {
        name = get(this, 'scope.currentCluster.id')
      } else {
        const projectId = get(this, 'scope.currentProject.id') || ''

        name = `${ get(this, 'scope.currentCluster.id') }_${ projectId.split(':')[1] }`
      }

      let key = `ca_file`

      switch (customType) {
      case 'kafka':
        key = `ssl_ca_cert`
        break;
      case 'fluentForwarder':
        key = `tls_cert_path`
        break;
      }

      return `${ key } /fluentd/etc/config/ssl/${ pageScope }_${ name }_ca.pem`
    }

    return null;
  }),

  onResize() {
    if ( get(this, 'autoResize') ) {
      this.fit();
    }
  },

  fit() {
    if ( get(this, 'autoResize') ) {
      var container = $('.codemirror-container');

      if ( !container ) {
        return;
      }

      const position = container.position();

      if ( !position ) {
        return;
      }

      const desired = $(window).height() - position.top - get(this, 'resizeFooter');

      container.css('max-height', Math.max(get(this, 'minHeight'), desired));
    }
  },

  formatValue() {
    const { customType } = this
    const config = get(this, `parentModel.${ get(this, 'customType') }.config`) || {}
    let { fileObj } = this.parseValue(get(this, 'value'));

    const deletedField = [
      'ca_file',
      'client_cert',
      'client_key',
      'ssl_ca_cert',
      'ssl_client_cert',
      'ssl_client_cert_key',
      'tls_cert_path',
      'client_cert_key',
      'tls_client_private_key_path',
      'tls_client_cert_path',
      'hosts',
      'user',
      'host',
      'port',
      'password',
      'logstash_prefix',
      'logstash_dateformat',
      'token',
      'sourcetype',
      'default_index',
      'zookeeper',
      'default_topic',
      'brokers',
      'protocol',
      'program',
      'severity',
    ]

    deletedField.map((d) => delete fileObj[d])

    let fileToForm = {}
    let serverTags = ''

    if (customType === 'fluentForwarder') {
      fileToForm = C.LOGGING_FILE_TO_FORM.FLUENTD
      const fluentServers = get(config, 'fluentServers') || []

      serverTags = fluentServers.map((server) => {
        const obj = {}
        const endponitSplitter = (get(server, 'endpoint') || '').split(':')

        Object.keys(fileToForm).map((key) => {
          if (key === 'host' && get(server, 'endpoint')) {
            set(obj, 'host', endponitSplitter[0])
          }

          if (key === 'port' && get(server, 'endpoint')) {
            set(obj, 'port', endponitSplitter[1])
          }

          const value = fileToForm[key]

          if (value && get(server, value)) {
            set(obj, key, get(server, value))
          }
        })

        let body = '';

        for (let key in obj) {
          if (key === 'elements') {
            return
          }

          body += `    ${ key } ${ obj[key] }\n`;
        }

        return `  <server>
${ body }
  </server>
`
      }).join(`\n`)
    } else {
      if (customType === 'elasticsearch') {
        fileToForm = C.LOGGING_FILE_TO_FORM.ELASTICSEARCH
      } else if (customType === 'splunk') {
        fileToForm = C.LOGGING_FILE_TO_FORM.SPLUNK
      } else if (customType === 'kafka') {
        fileToForm = C.LOGGING_FILE_TO_FORM.KAFKA

        let { brokerEndpoints = [] } = config

        if (get(config, 'brokerEndpoints.length') > 0) {
          brokerEndpoints = brokerEndpoints.map((e = '') => e.replace('http://', '').replace('https://', ''))
          set(config, 'brokers', brokerEndpoints.join(','))
        }
      } else if (customType === 'syslog') {
        fileToForm = C.LOGGING_FILE_TO_FORM.SYSLOG
      }

      Object.keys(fileToForm).filter((key) => get(config, key)).map((d) => delete fileObj[d])

      const endponitSplitter = (get(config, 'endpoint') || '')
        .replace('http://', '')
        .replace('https://', '')
        .split(':')

      Object.keys(fileToForm).map((key) => {
        const value = fileToForm[key]

        if (key === 'host' && endponitSplitter[0]) {
          set(fileObj, 'host', endponitSplitter[0])

          return
        }

        if (key === 'port' && endponitSplitter[1]) {
          set(fileObj, 'port', endponitSplitter[1])

          return
        }

        if (value && get(config, value)) {
          if (key === 'logstash_dateformat') {
            set(fileObj, key, DATE_FORMAT[get(config, value)])
          } else {
            set(fileObj, key, get(config, value))
          }
        }
      })
    }

    const {
      clientKeyPath = '', clientCertPath = '', certificatePath = ''
    } = this;

    const caArray = [clientKeyPath, clientCertPath, certificatePath].map((c = '') => {
      if (typeof c === 'string') {
        const arr = c.split(' ')

        return {
          key:   arr[0],
          value: arr[1],
        }
      } else {
        return
      }
    }).filter((c) => c)

    caArray.map((c) => {
      if (c.value) {
        fileObj[c.key] = c.value;
      }
    })

    let body = '';

    for (let key in fileObj) {
      if (key === 'elements') {
        continue
      }

      body += `  ${ key } ${ fileObj[key] }\n`;
    }

    const out = `<match *>
${ body }
${ serverTags }
</match>`

    this.send('updateValue', out)
  }
});
