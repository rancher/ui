import { get, computed, set, setProperties } from '@ember/object';
import Component from '@ember/component';
import { alias } from '@ember/object/computed'
import parseUri from 'shared/utils/parse-uri';
import { inject as service } from '@ember/service';

const endpointText = {
  hostError:     'loggingPage.fluentd.endpointHostError',
  portError: 'loggingPage.fluentd.endpointPortError',
}

export default Component.extend({
  store: service(),

  showAdvanced:      false,
  endpointErrorText: null,
  index:             null,
  endpointError:     false,

  config:        alias('model.config'),
  fluentServers: alias('model.config.fluentServers'),

  init() {
    this._super();
    const fluentServers = get(this, 'config.fluentServers');

    if (!fluentServers) {
      this.send('add')
    } else {
      this.convertToPlainObj()
    }
  },

  didInsertElement() {
    this.$('.fluentd-endpoint:first').focus()
  },

  didUpdateAttrs() {
    this.convertToPlainObj()
  },

  actions: {
    add() {
      const ary = get(this, 'fluentServers');

      const defaultFluentServers = {
        endpoint:  '',
        password:  '',
        sharedKey: '',
        standby:   false,
        username:  '',
        weight:    100,
        hostname:  '',
      }

      if (!ary) {
        set(this, 'fluentServers', [defaultFluentServers]);
      } else {
        ary.pushObject(defaultFluentServers);
      }
    },
    remove(item, idx) {
      if (get(this, 'canRemove')) {
        if (idx === get(this, 'index')) {
          setProperties(this, {
            endpointError:    false,
            endpointValidate: true,
          })
        }
        get(this, 'fluentServers').removeObject(item);
      }
    },
    alertMessage(idx, value = '') {
      if (value.startsWith('https://') || value.startsWith('http://')) {
        setProperties(this, {
          endpointErrorText: endpointText.hostError,
          endpointError:     true,
          endpointValidate:  false,
          index:             idx,
        })

        return
      }
      const urlParser = parseUri(value) || {}

      if (!urlParser.port) {
        setProperties(this, {
          endpointErrorText: endpointText.portError,
          endpointError:     true,
          endpointValidate:  false,
          index:             idx,
        })

        return
      }

      setProperties(this, {
        endpointError:     false,
        endpointValidate:  true,
      })
    },
  },

  canRemove: computed('fluentServers.length', function() {
    return get(this, 'fluentServers.length') > 1;
  }),

  logPreview: computed('fieldsStr', function() {
    const fieldsStr = get(this, 'fieldsStr');
    const template = `{
    "log":    "time=\"${ new Date().toString() }\" level=info msg=\"Cluster [local] condition status unknown\"\n",
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

  convertToPlainObj() {
    const fluentServers = get(this, 'config.fluentServers') || [];

    set(this, 'fluentServers', fluentServers.map((f) => ({
      endpoint:  f.endpoint,
      password:  f.password,
      sharedKey: f.sharedKey,
      standby:   f.standby,
      username:  f.username,
      weight:    f.weight,
      hostname:  f.hostname,
    })))
  },

});
