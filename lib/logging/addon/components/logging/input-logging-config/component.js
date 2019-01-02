import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { isSafari } from 'ui/utils/platform';
import layout from './template';
import { next } from '@ember/runloop';
import { get, set, observer, computed } from '@ember/object';
import { Promise as EmberPromise, all } from 'rsvp';
import ThrottledResize from 'shared/mixins/throttled-resize';
import { downloadFile } from 'shared/utils/download-files';
import CodeMirror from 'codemirror';
import jsyaml from 'js-yaml';
import { alias } from '@ember/object/computed'

export default Component.extend(ThrottledResize, {
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

  shouldChangeName: true,

  config:        alias('model.config'),

  init() {
    this._super(...arguments);

    window.jsyaml || (window.jsyaml = jsyaml);
  },

  actions: {
    click() {
      this.$('INPUT[type=file]')[0].click();
    },

    wantsChange() {
      set(this, 'shouldChangeName', true);
    },

    download() {
      let yaml = get(this, 'value');
      const lintError = [];

      jsyaml.safeLoadAll(yaml, (y) => {
        lintError.pushObjects(CodeMirror.lint.yaml(y));
      });

      if ( lintError.length ) {
        set(this, 'errors', [get(this, 'intl').t('yamlPage.errors')]);

        return;
      }

      downloadFile(get(this, 'filename'), yaml);
    },

    updateValue(value) {
      set(this, 'value', value)
    },
  },

  loadingDidChange: observer('loading', function() {
    if ( !get(this, 'loading') && get(this, 'autoResize') ) {
      next(() => {
        this.fit();
      });
    }
  }),

  caChange: observer('config.clientKey', 'config.clientCert', 'config.certificate', function() {
    let fileObj = this.parseValue(get(this, 'value'))

    delete fileObj.ca_file
    delete fileObj.client_cert
    delete fileObj.client_key
    delete fileObj.ssl_ca_cert
    delete fileObj.ssl_client_cert
    delete fileObj.ssl_client_cert_key
    delete fileObj.tls_cert_path

    const {
      clientKeyPath = {}, clientCertPath = {}, certificatePath = {}
    } = this

    let body = ''

    if (clientKeyPath.value) {
      fileObj[clientKeyPath.key] = clientKeyPath.value
    }
    if (clientCertPath.value) {
      fileObj[clientCertPath.key] = clientCertPath.value
    }
    if (certificatePath.value) {
      fileObj[certificatePath.key] = certificatePath.value
    }

    for (let key in fileObj) {
      body += `  ${ key } ${ fileObj[key] }
`
    }

    const out = `<match *>
${ body }</match>`

    this.send('updateValue', out)
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

  clientKeyPath: computed('config.clientKey', 'customType', function() {
    const pageScope = get(this, 'pageScope')
    const customType = get(this, 'customType')
    let name

    if (get(this, 'config.clientKey')) {
      if (pageScope === 'cluster') {
        name = get(this, 'scope.currentCluster.name')
      } else {
        name = get(this, 'scope.currentProject.name')
      }

      let key = `client_key`

      switch (customType) {
      case 'kafka':
        key = `ssl_client_cert_key`
        break;
      case 'syslog':
        key = `client_cert_key`
        break;
      }

      return {
        key,
        value: `/fluentd/etc/ssl/${ pageScope }_${ name }_client-key.pem`,
      }
    }
  }),

  clientCertPath: computed('config.clientCert', 'customType', function() {
    const pageScope = get(this, 'pageScope')
    const customType = get(this, 'customType')
    let name

    if (get(this, 'config.clientCert')) {
      if (pageScope === 'cluster') {
        name = get(this, 'scope.currentCluster.name')
      } else {
        name = get(this, 'scope.currentProject.name')
      }

      let key = `client_cert`

      if (customType === 'kafka') {
        key = `ssl_client_cert`
      }

      return {
        key,
        value: `/fluentd/etc/ssl/${ pageScope }_${ name }_client-cert.pem`
      }
    }
  }),

  certificatePath: computed('config.certificate', 'customType', function() {
    const pageScope = get(this, 'pageScope')
    const customType = get(this, 'customType')
    let name

    if (get(this, 'config.certificate')) {
      if (pageScope === 'cluster') {
        name = get(this, 'scope.currentCluster.name')
      } else {
        name = get(this, 'scope.currentProject.name')
      }

      let key = `ca_file`

      switch (customType) {
      case 'kafka':
        key = `ssl_ca_cert`
        break;
      case 'fluentd':
        key = `tls_cert_path`
        break;
      }

      return {
        key,
        value: `/fluentd/etc/ssl/${ pageScope }_${ name }_ca.pem`
      }
    }
  }),

  customType: computed('value', function() {
    const value = get(this, 'value')
    const fileObj = this.parseValue(value)
    const type = fileObj['@type']
    let out

    switch (type) {
    case 'elasticsearch':
      out = 'elasticsearch'
      break;
    case 'splunk_hec':
      out = 'splunk'
      break;
    case 'kafka_buffered':
      out = 'kafka'
      break;
    case 'remote_syslog':
      out = 'syslog'
      break;
    case 'forward':
      out = 'fluentd'
      break;
    }

    return out
  }),

  onResize() {
    if ( get(this, 'autoResize') ) {
      this.fit();
    }
  },

  fit() {
    if ( get(this, 'autoResize') ) {
      var container = this.$('.codemirror-container');

      if ( !container ) {
        return;
      }

      const position = container.position();

      if ( !position ) {
        return;
      }

      const desired = this.$(window).height() - position.top - get(this, 'resizeFooter');

      container.css('max-height', Math.max(get(this, 'minHeight'), desired));
    }
  },

  change(event) {
    var input = event.target;

    if ( !input.files || !input.files.length ) {
      return;
    }

    if ( get(this, 'canChangeName') ) {
      const firstName = input.files[0].name;

      if ( get(this, 'multiple') ) {
        const ext = firstName.replace(/.*\./, '');

        set(this, 'name', `multiple.${ ext }`);
      } else {
        set(this, 'name', firstName);
      }

      set(this, 'shouldChangeName', false);
    }

    const promises = [];
    let file;

    for ( let i = 0 ; i < input.files.length ; i++ ) {
      file = input.files[i];
      promises.push(new EmberPromise((resolve, reject) => {
        var reader = new FileReader();

        reader.onload = (res) => {
          var out = res.target.result;

          resolve(out);
        };

        reader.onerror = (err) => {
          get(this, 'growl').fromError(get(err, 'srcElement.error.message'));
          reject(err);
        };

        reader.readAsText(file);
      }));
    }

    all(promises).then((res) => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      let value = res.join('\n');

      set(this, 'value', value);
      if ( value ) {
        this.sendAction('fileChosen');
      }
    }).finally(() => {
      input.value = '';
    });
  },

  parseValue(value = '') {
    let fileObj = {}

    const myString = value.replace(/(\r\n|\n|\r)/gm, '<br />');

    const keyAndValue = myString.split('<br />').filter((f) => f !== '<br />').filter((f = '') => !f.startsWith('#') && !f.startsWith('<'))

    keyAndValue.map((item = '') => {
      const arr = item.split(' ').filter((f) => f !== '')

      if (arr[0] && arr[1]) {
        set(fileObj, arr[0], arr[1])
      }
    })

    return fileObj
  },

});
