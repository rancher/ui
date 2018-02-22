import EmberObject from '@ember/object';
import Component from '@ember/component';
import { reads, alias } from '@ember/object/computed';
import { get, set } from '@ember/object'
import { next } from '@ember/runloop';
import NewOrEdit from 'ui/mixins/new-or-edit';
import { inject as service } from '@ember/service'

export default Component.extend(NewOrEdit, {
  router: service(),
  intl: service(),
  globalStore: service(),
  pageScope: reads('scope.currentPageScope'),
  scope: service(),
  newAlert: alias('resourceMap.newAlert'),

  showAdvanced: false,
  errors: null,
  pods: null,
  workloads: null,

  validateRecipients(alert, errors) {
    const validRecipients = [];
    const recipients = alert.get('recipients');
    // TODO, why r.validationErrors is not a function
    // validate recipients
    // recipients.forEach(r => {
    //   const errs = r.validationErrors();
    //   if (errs && errs.length > 0) {
    //     return;
    //   }
    //   validRecipients.push(r);
    // });
    const filteredRecipients = recipients.filter(r => !!r.notifierId);
    if (filteredRecipients.length === 0) {
      errors.push(['Recipient required']);
    } else {
      alert.set('recipients', filteredRecipients);
    }
  },
  beforeSaveProjectAlert() {
    const newAlert = get(this, 'newAlert');
    const t = newAlert.get('_targetType');
    const clone = newAlert.clone();
    const errors = [];
    // project _targetType:
    // 1. workload
    // 2. workloadSelector
    // 3. Pod
    if (t === 'workload') {
      const type = clone.get('targetWorkload.workloadType');
      clone.setProperties({
        targetPod: null,
        'targetWorkload.selector': null,
        'targetWorkload.type': type,
      });
    }
    if (t === 'workloadSelector') {
      const type = clone.get('targetWorkload.workloadSelectorType');
      const selector = clone.get('targetWorkload.selector') || {};
      const keys = Object.keys(selector);
      if (keys.length === 0) {
        errors.push('Workload selector required');
      };
      clone.setProperties({
        targetPod: null,
        'targetWorkload.workloadId': null,
        'targetWorkload.type': type,
      });
    }
    if (t === 'pod') {
      clone.setProperties({
        targetWorkload: null,
      });
    }
    this.validateRecipients(clone, errors);
    set(this, 'errors', errors);
    return clone;
  },

  beforeSaveClusterAlert() {
    // cluster _targetType:
    // 1. node
    // 2. nodeSelector
    // 3. systemService
    // 4. k8s event
    const newAlert = get(this, 'newAlert');
    const t = newAlert.get('_targetType');
    const clone = newAlert.clone();
    const errors = [];

    console.log(clone)
    if (t === 'node') {
      clone.setProperties({
        'targetNode.selector': null,
        targetSystemService: null,
        targetEvent: null,
      });
    }

    if (t === 'nodeSelector') {
      const selector = clone.get('targetNode.selector') || {};
      const keys = Object.keys(selector);
      if (keys.length === 0) {
        errors.push('Node selector required');
      };
      clone.setProperties({
        'targetNode.nodeId': null,
        targetSystemService: null,
        targetEvent: null,
      });
    }

    if (t === 'systemService') {
      clone.setProperties({
        targetNode: null,
        targetEvent: null,
      });
    }

    if (t === 'warningEvent' || t === 'normalEvent') {
      clone.setProperties({
        targetNode: null,
        targetSystemService: null,
      });
    }
    this.validateRecipients(clone, errors);
    set(this, 'errors', errors);
    return clone;
  },

  doneSaving() {
    this.send('cancel');
  },

  actions: {
    showAdvanced() {
      this.set('showAdvanced', true);
    },

    save(cb) {
      set(this, 'errors', null);
      const ps = get(this, 'pageScope');
      let toSaveAlert;
      if (ps === 'cluster') {
        toSaveAlert = this.beforeSaveClusterAlert();
      } else {
        toSaveAlert = this.beforeSaveProjectAlert();
      }
      if (get(this, 'errors') && get(this, 'errors').length > 0) {
        cb();
        return;
      }
      set(this, 'primaryResource', toSaveAlert);
      this._super(cb);
    },

    cancel() {
      const ps = get(this, 'pageScope');
      const router = get(this, 'router');
      if (ps === 'cluster') {
        router.transitionTo('authenticated.cluster.alert.index');
      } else {
        router.transitionTo('authenticated.project.alert.index');
      }
    },
  },
});
