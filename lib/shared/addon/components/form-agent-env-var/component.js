import Component from '@ember/component';
import { inject as service } from '@ember/service';
import layout from './template';
import { computed, get, set } from '@ember/object';

export default Component.extend({
  globalStore: service(),
  intl:        service(),
  layout,

  model:    null,
  editable: true,

  statusClass:          null,
  status:               null,
  editing:              true,
  showCustomConfigMaps: false,
  showCustomSecrets:    false,
  typeChoices:          [],
  configMaps:           [],
  secrets:              [],
  value:                [],
  resourceKeyChoices:   [],
  init() {
    this._super(...arguments);

    const configMapsEnabled = this.showCustomConfigMaps || this.configMaps?.length > 0;
    const secretsEnabled = this.showCustomSecrets || this.secrets?.length > 0;

    const typeChoices = [
      {
        label: this.intl.t('formAgentEnvVar.typeChoices.keyValue'),
        value: 'keyValue'
      },
      {
        label: this.intl.t('formAgentEnvVar.typeChoices.resource'),
        value: 'resource'
      },
      {
        label:    configMapsEnabled ? this.intl.t('formAgentEnvVar.typeChoices.configMap') : this.intl.t('formAgentEnvVar.typeChoices.configMapNone'),
        disabled: !configMapsEnabled,
        value:    'configMap'
      },
      {
        label:    secretsEnabled ? this.intl.t('formAgentEnvVar.typeChoices.secret') : this.intl.t('formAgentEnvVar.typeChoices.secretNone'),
        disabled: !secretsEnabled,
        value:    'secret'
      },
      {
        label: this.intl.t('formAgentEnvVar.typeChoices.podField'),
        value: 'podfield'
      }
    ];

    this.set('typeChoices', typeChoices);

    this.set('resourcekeyChoices', [
      {
        label: 'limits.cpu',
        value: 'limits.cpu'
      },
      {
        label: 'limits.ephemeral-storage',
        value: 'limits.ephemeral-storage'
      },
      {
        label: 'limits.memory',
        value: 'limits.memory'
      },
      {
        label: 'requests.cpu',
        value: 'requests.cpu'
      },
      {
        label: 'requests.ephemeral-storage',
        value: 'requests.ephemeral-storage'
      },
      {
        label: 'requests.memory',
        value: 'requests.memory'
      },
    ]);

    this.set('value', this.value || []);


    this.value.forEach((envVar) => this.inferTypeAndSetHelpers(envVar));
  },

  actions: {
    add() {
      this.value.pushObject(this.createEnvVar('keyValue'));
    },
    updateType(index, event) {
      const type = event.target.value;

      this.value.replace(index, 1, [this.createEnvVar(type)]);
    },
    updateSecret(index, event) {
      const secretName = event.target.value;

      set(this.value[index], 'secretKeyChoices', this.keyChoices('secrets', secretName));
      set(this.value[index], 'valueFrom.secretKeyRef.name', secretName);
      set(this.value[index], 'valueFrom.secretKeyRef.key', this.value[index].secretKeyChoices[0].value);
    },
    updateConfigMap(index, event) {
      const configMapName = event.target.value;

      set(this.value[index], 'configMapKeyChoices', this.keyChoices('configMaps', configMapName));
      set(this.value[index], 'valueFrom.configMapKeyRef.name', configMapName);
      set(this.value[index], 'valueFrom.configMapKeyRef.key', this.value[index].configMapKeyChoices[0].value);
    },
    remove(index) {
      this.value.removeAt(index, 1);
    },
  },

  configMapChoices: computed('configMaps', function() {
    const configMaps = get(this, 'configMaps') || [];
    const choices = configMaps.map((configMap) => ({
      label: configMap.displayName,
      value: configMap.name
    }));

    return choices
      .uniqBy('label')
      .sortBy('label');
  }),

  secretChoices: computed('secrets', function() {
    const secrets = get(this, 'secrets') || [];
    const choices = secrets.map((secret) => ({
      label: secret.displayName,
      value: secret.name
    }));

    return choices
      .uniqBy('label')
      .sortBy('label');
  }),

  inferTypeAndSetHelpers(envVar) {
    if (this.isValueFromSet(envVar, 'resourceFieldRef', ['resource', 'containerName', 'divisor'])) {
      return this.setEnvVarHelpers(envVar, 'resource');
    }

    if (this.isValueFromSet(envVar, 'configMapKeyRef', ['name', 'key'])) {
      return this.setEnvVarHelpers(envVar, 'configMap');
    }

    if (this.isValueFromSet(envVar, 'secretKeyRef', ['name', 'key'])) {
      return this.setEnvVarHelpers(envVar, 'secret');
    }

    if (this.isValueFromSet(envVar, 'fieldRef', ['fieldPath'])) {
      return this.setEnvVarHelpers(envVar, 'podfield');
    }

    return this.setEnvVarHelpers(envVar, 'keyValue');
  },

  isValueFromSet(envVar, refKey, fields) {
    return fields.some((field) => get(envVar, `valueFrom.${ refKey }.${ field }`));
  },

  keyChoices(resource, selectedName) {
    const resources = get(this, resource) || [];
    const data = resources
      .filter((r) => r)
      .find((r) => r.name === selectedName)?.data || {};

    return Object.keys(data).map((key) => ({
      label: key,
      value: key
    }))
  },

  showContainer(type) {
    return ['resource'].includes(type);
  },

  showKey(type) {
    return ['resource', 'configMap', 'secret', 'podfield'].includes(type);
  },

  showValue(type) {
    return ['keyValue'].includes(type);
  },

  showConfigMap(type) {
    return ['configMap'].includes(type);
  },

  showSecret(type) {
    return ['secret'].includes(type);
  },

  showPodField(type) {
    return ['podfield'].includes(type);
  },
  createEnvVar(type) {
    const envVar = {};

    this.setEnvVarHelpers(envVar, type);
    this.setDefaults(envVar, type);

    return envVar;
  },

  setEnvVarHelpers(envVar, type) {
    Object.assign(envVar, {
      type,
      showContainer:       this.showContainer(type),
      showKey:             this.showKey(type),
      showValue:           this.showValue(type),
      showConfigMap:       this.showConfigMap(type),
      showSecret:          this.showSecret(type),
      showPodField:        this.showPodField(type),
      secretKeyChoices:    envVar.valueFrom?.secretKeyRef ? this.keyChoices('secrets', envVar.valueFrom.secretKeyRef.name) : null,
      configMapKeyChoices: envVar.valueFrom?.configMapKeyRef ? this.keyChoices('configMaps', envVar.valueFrom.configMapKeyRef.name) : null,
    });
  },

  setDefaults(envVar, type) {
    if (type !== 'keyValue') {
      set(envVar, 'valueFrom', envVar.valueFrom || {});
    }

    if (type === 'configMap') {
      set(envVar, 'valueFrom.configMapKeyRef', envVar.valueFrom.configMapKeyRef || {});
      const configMapName = this.configMapChoices[0]?.value;

      set(envVar, 'configMapKeyChoices', this.keyChoices('configMaps', configMapName));
      set(envVar, 'valueFrom.configMapKeyRef', envVar.valueFrom.configMapKeyRef || {});
      set(envVar, 'valueFrom.configMapKeyRef.name', envVar.valueFrom.configMapKeyRef.name || configMapName);
      set(envVar, 'valueFrom.configMapKeyRef.key', envVar.valueFrom.configMapKeyRef.key || envVar.configMapKeyChoices[0]?.value);
    }
    if (type === 'resource') {
      set(envVar, 'valueFrom.resourceFieldRef', envVar.valueFrom.resourceFieldRef || {});
    }
    if (type === 'podfield') {
      set(envVar, 'valueFrom.fieldRef', envVar.valueFrom.fieldRef || {});
    }

    if (type === 'secret') {
      const secretName = this.secretChoices[0]?.value;

      set(envVar, 'secretKeyChoices', this.keyChoices('secrets', secretName));
      set(envVar, 'valueFrom.secretKeyRef', envVar.valueFrom.secretKeyRef || {});
      set(envVar, 'valueFrom.secretKeyRef.name', envVar.valueFrom.secretKeyRef.name || secretName);
      set(envVar, 'valueFrom.secretKeyRef.key', envVar.valueFrom.secretKeyRef.key || envVar.secretKeyChoices[0]?.value);
    }
  }
});
