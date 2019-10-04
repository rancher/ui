import Errors from 'ui/utils/errors';
import { get, set, setProperties, observer } from '@ember/object';
import { equal } from '@ember/object/computed';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import C from 'ui/utils/constants';
import ChildHook from 'shared/mixins/child-hook';
import layout from './template';
import $ from 'jquery';
import { on } from '@ember/object/evented';

const WINDOWS_NODE_SELECTOR = 'beta.kubernetes.io/os = windows';
const LINUX_NODE_SELECTOR = 'beta.kubernetes.io/os != windows';
const LINUX = 'linux';
const WINDOWS = 'windows';

export default Component.extend(NewOrEdit, ChildHook, {
  clusterStore: service(),
  intl:         service(),
  prefs:        service(),
  scope:        service(),
  settings:     service(),

  layout,
  tagName: 'form',

  isUpgrade:         false,
  service:           null,
  launchConfig:      null,
  launchConfigIndex: null,

  namespace: null,
  scale:     1,
  scaleMode: null,

  serviceLinksArray:     null,
  isRequestedHost:       null,
  upgradeOptions:        null,
  separateLivenessCheck: false,
  targetOs:              WINDOWS,

  // Errors from components
  commandErrors:    null,
  volumeErrors:     null,
  networkingErrors: null,
  secretsErrors:    null,
  readyCheckErrors: null,
  liveCheckErrors:  null,
  schedulingErrors: null,
  securityErrors:   null,
  scaleErrors:      null,
  imageErrors:      null,
  portErrors:       null,
  namespaceErrors:  null,
  labelErrors:      null,
  annotationErrors: null,

  // ----------------------------------
  advanced:     false,
  header:        '',
  showTargetOS: false,

  isSidekick:    equal('scaleMode', 'sidekick'),
  init() {
    window.nec = this;
    this._super(...arguments);

    if (get(this, 'launchConfig') && !get(this, 'launchConfig.environmentFrom')) {
      set(this, 'launchConfig.environmentFrom', []);
    }

    const service = get(this, 'service');

    const scheduling = get(service, 'scheduling')

    if (!get(this, 'isSidekick') && !get(service, 'scheduling.node')) {
      set(service, 'scheduling', {
        ...scheduling,
        node: {}
      });
    }

    if (!get(this, 'isSidekick')) {
      setProperties(this, {
        description: get(this, 'service.description'),
        scale:       get(this, 'service.scale'),
        scheduling:  get(this, 'service.scheduling'),
      });
    } else {
      set(this, 'description', get(this, 'launchConfig.description'));
    }
    set(this, 'name', get(this, 'launchConfig.name'));

    let namespaceId = null;

    namespaceId = get(this, 'service.namespaceId');

    if (namespaceId) {
      let namespace = get(this, 'clusterStore').getById('namespace', namespaceId);

      if (namespace) {
        set(this, 'namespace', namespace);
      }
    }

    if (!get(this, 'separateLivenessCheck')) {
      const ready = get(this, 'launchConfig.readinessProbe');
      const live = get(this, 'launchConfig.livenessProbe');
      const readyStr = JSON.stringify(ready);
      const liveStr = JSON.stringify(live);

      if (readyStr !== liveStr) {
        set(this, 'separateLivenessCheck', true);
      }
    }

    if ( get(this, 'showTargetOS') && get(this, `prefs.${ C.PREFS.TARGET_OS }`) ) {
      set(this, 'targetOs', get(this, `prefs.${ C.PREFS.TARGET_OS }`));
    }
  },

  didInsertElement() {
    const input = $("INPUT[type='text']")[0];

    if (input) {
      input.focus();
    }
  },

  actions: {
    setTargetOs(os) {
      set(this, 'targetOs', os);
    },

    setImage(uuid) {
      set(this, 'launchConfig.image', uuid);
    },

    setRequestedHostId(hostId) {
      set(this, 'launchConfig.requestedHostId', hostId);
    },

    setUpgrade(upgrade) {
      set(this, 'upgradeOptions', upgrade);
    },

    done() {
      if (this.done) {
        this.done();
      }
    },

    cancel() {
      if (this.cancel) {
        this.cancel();
      }
    },

    toggleSeparateLivenessCheck() {
      set(this, 'separateLivenessCheck', !get(this, 'separateLivenessCheck'));
    },

    removeSidekick(idx) {
      var ary = get(this, 'primaryService.secondaryLaunchConfigs');

      ary.removeAt(idx);
    },
  },

  updateHeader: on('init', observer('isUpgrade', 'isSidekick', 'isGlobal', 'service.displayName', 'intl.locale', function() {
    let args = {};
    let k = 'newContainer.';

    k += `${ get(this, 'isUpgrade') ? 'upgrade' : 'add'  }.`;
    if (get(this, 'isSidekick')) {
      let svc = get(this, 'service');

      if (svc && get(svc, 'id')) {
        k += 'sidekickName';
        args = { name: get(this, 'service.displayName') };
      } else {
        k += 'sidekick';
      }
    } else if (get(this, 'isGlobal')) {
      k += 'globalService';
    } else {
      k += 'service';
    }

    next(() => {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }

      set(this, 'header', get(this, 'intl').t(k, args));
    });
  })),

  // ----------------------------------
  // ----------------------------------
  // Save
  // ----------------------------------
  validate() {
    let pr = get(this, 'primaryResource');
    let errors = pr.validationErrors() || [];
    const lc = get(this, 'launchConfig');

    const quotaErrors = lc.validateQuota(get(this, 'namespace'));

    errors.pushObjects(quotaErrors);

    if ( get(quotaErrors, 'length') > 0 ) {
      setProperties(this, {
        advanced:                true,
        securitySectionExpanded: true
      });
    }

    (get(this, 'service.secondaryLaunchConfigs') || []).forEach((slc) => {
      slc.validationErrors().forEach((err) => {
        errors.push(`${ get(slc, 'displayName')  }: ${  err }`);
      });
    });

    // Errors from components
    errors.pushObjects(get(this, 'commandErrors') || []);
    errors.pushObjects(get(this, 'volumeErrors') || []);
    errors.pushObjects(get(this, 'networkingErrors') || []);
    errors.pushObjects(get(this, 'secretsErrors') || []);
    errors.pushObjects(get(this, 'readyCheckErrors') || []);
    errors.pushObjects(get(this, 'liveCheckErrors') || []);
    errors.pushObjects(get(this, 'schedulingErrors') || []);
    errors.pushObjects(get(this, 'securityErrors') || []);
    errors.pushObjects(get(this, 'scaleErrors') || []);
    errors.pushObjects(get(this, 'imageErrors') || []);
    errors.pushObjects(get(this, 'portErrors') || []);
    errors.pushObjects(get(this, 'namespaceErrors') || []);
    errors.pushObjects(get(this, 'labelErrors') || []);
    errors.pushObjects(get(this, 'annotationErrors') || []);

    errors = errors.uniq();

    if (get(errors, 'length')) {
      set(this, 'errors', errors);

      if ( get(this, 'isSidekick') && !get(this, 'isUpgrade') ) {
        get(pr, 'secondaryLaunchConfigs').pop();
      }

      return false;
    }

    set(this, 'errors', null);

    return true;
  },

  willSave() {
    let intl = get(this, 'intl');
    let pr;
    let nameResource;
    let lc = get(this, 'launchConfig');
    let name = (get(this, 'name') || '').trim().toLowerCase();
    let service = get(this, 'service');

    let readinessProbe = get(lc, 'readinessProbe');

    if ( get(this, 'showTargetOS') && ( get(this, 'targetOs') === LINUX || get(this, 'targetOs') === WINDOWS )  ) {
      const selector = get(this, 'targetOs') === WINDOWS ? WINDOWS_NODE_SELECTOR : LINUX_NODE_SELECTOR;

      if ( !get(service, 'scheduling') ) {
        set(service, 'scheduling', { node: { requireAll: [selector] } });
      } else if ( !get(service, 'scheduling.node') ) {
        set(service, 'scheduling.node', { requireAll: [selector] });
      } else if ( !get(service, 'scheduling.node.requireAll') ) {
        set(service, 'scheduling.node.requireAll', [selector]);
      } else {
        const requireAll = get(service, 'scheduling.node.requireAll') || [];
        const found = requireAll.find((r) => r && r.replace(/\s+/g, '') === selector.replace(/\s+/g, ''));

        if ( !found ) {
          requireAll.push(selector);
        }
      }
    }

    if (!get(this, 'separateLivenessCheck')) {
      if ( readinessProbe ) {
        const livenessProbe = Object.assign({}, readinessProbe);

        set(livenessProbe, 'successThreshold', 1);
        set(lc, 'livenessProbe', livenessProbe);
      } else {
        set(lc, 'livenessProbe', null);
      }
    }
    const uid = get(lc, 'uid');

    if ( uid === '' ) {
      set(lc, 'uid', null);
    }

    if (get(this, 'isSidekick')) {
      let errors = [];

      if (!service) {
        errors.push(get(this, 'intl').t('newContainer.errors.noSidekick'));
        set(this, 'errors', errors);

        return false;
      }

      if (!name) {
        errors.push(intl.t('validation.required', { key: intl.t('formNameDescription.name.label') }));
        set(this, 'errors', errors);

        return false;
      }

      pr = service;
      nameResource = lc;

      let slc = get(pr, 'secondaryLaunchConfigs');

      if (!slc) {
        slc = [];
        set(pr, 'secondaryLaunchConfigs', slc);
      }

      let lci = get(this, 'launchConfigIndex');

      if (lci === undefined || lci === null) {
        // If it's a new sidekick, add it to the end of the list
        lci = slc.length;
      } else {
        lci = parseInt(lci, 10)
      }

      let duplicate = pr.containers.find((x, idx) => idx !== lci + 1 && get(x, 'name').toLowerCase() === name);

      if (duplicate) {
        errors.push(intl.t('newContainer.errors.duplicateName', {
          name,
          service: get(duplicate, 'displayName')
        }));
        set(this, 'errors', errors);

        return false;
      }

      slc[lci] = lc;

      set(lc, 'name', name);
      set(pr, 'containers', [pr.containers[0]]);
      pr.containers.pushObjects(slc);
    } else {
      service.clearConfigsExcept(`${ get(this, 'scaleMode')  }Config`);
      if ( get(this, 'scaleMode') === 'statefulSet' &&  !get(service, 'statefulSetConfig.serviceName') ) {
        set(service, 'statefulSetConfig.serviceName', name);
      }
      pr = service;
      nameResource = pr;
      set(pr, 'scale', get(this, 'scale'));
      const containers = get(pr, 'containers');

      if (!containers) {
        set(pr, 'containers', []);
      } else {
        set(lc, 'name', name);
        containers[0] = lc
      }
    }

    nameResource.setProperties({
      name,
      description: get(this, 'description'),
    });

    set(this, 'primaryResource', pr);
    set(this, 'originalPrimaryResource', pr);

    let errors = [];

    if (!get(this, 'namespace.name')) {
      errors.push(intl.t('validation.required', { key: intl.t('generic.namespace') }));
      set(this, 'errors', errors);

      return false;
    }

    set(pr, 'namespaceId', get(this, 'namespace.id') || '__placeholder__');
    const self = this;
    const sup = this._super;

    pr.updateTimestamp();

    return this.applyHooks('_beforeSaveHooks').then(() => {
      set(pr, 'namespaceId', get(this, 'namespace.id'));

      return this.applyHooks('_volumeHooks').then(() => sup.apply(self, ...arguments))
        .catch((err) => {
          set(this, 'errors', [Errors.stringify(err)]);
        });
    })
      .catch((err) => {
        set(this, 'errors', [Errors.stringify(err)]);
      });
  },

  doneSaving() {
    if (!get(this, 'isUpgrade')) {
      let scaleMode = get(this, 'scaleMode');

      if (scaleMode === 'sidekick') {
        // Remember sidekick as service since you're not
        // likely to want to add many sidekicks in a row
        scaleMode = 'deployment';
      }
      set(this, `prefs.${ C.PREFS.LAST_SCALE_MODE }`, scaleMode);
      set(this, `prefs.${ C.PREFS.LAST_IMAGE_PULL_POLICY }`, get(this, 'launchConfig.imagePullPolicy'));
      set(this, `prefs.${ C.PREFS.LAST_NAMESPACE }`, get(this, 'namespace.id'));


      if ( get(this, 'showTargetOS') ) {
        set(this, `prefs.${ C.PREFS.TARGET_OS }`, get(this, 'targetOs'));
      }
    }
    if (this.done) {
      this.done();
    }
  },

});
