import { get, set } from '@ember/object';
import { equal } from '@ember/object/computed';
import { next } from '@ember/runloop';
import { resolve, reject, all } from 'rsvp';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import { debouncedObserver } from 'ui/utils/debounce';
import C from 'ui/utils/constants';
import ChildHook from 'shared/mixins/child-hook';
import { flattenLabelArrays } from 'shared/mixins/manage-labels';
import layout from './template';

export default Component.extend(NewOrEdit, ChildHook, {
  layout,
  clusterStore: service(),
  intl: service(),
  prefs: service(),
  settings: service(),

  tagName: 'form',

  isUpgrade:                  false,
  service:                    null,
  launchConfig:               null,
  containerName:              null,

  namespace:                  null,
  scale:                      1,
  scaleMode:                  null,

  serviceLinksArray:          null,
  isRequestedHost:            null,
  upgradeOptions:             null,
  separateLivenessCheck:      false,

  // Errors from components
  commandErrors:              null,
  volumeErrors:               null,
  networkingErrors:           null,
  secretsErrors:              null,
  readyCheckErrors:           null,
  liveCheckErrors:            null,
  schedulingErrors:           null,
  securityErrors:             null,
  scaleErrors:                null,
  imageErrors:                null,
  portErrors:                 null,
  namespaceErrors:            null,
  labelErrors:                null,
  annotationErrors:           null,

  actions: {
    setImage(uuid) {
      this.set('launchConfig.image', uuid);
    },

    setLabels(section,labels) {
      this.set(section+'Labels', labels);
    },

    setRequestedHostId(hostId) {
      this.set('launchConfig.requestedHostId', hostId);
    },

    setUpgrade(upgrade) {
      this.set('upgradeOptions', upgrade);
    },

    done() {
      this.sendAction('done');
    },

    cancel() {
      this.sendAction('cancel');
    },

    toggleSeparateLivenessCheck() {
      set(this, 'separateLivenessCheck', !get(this, 'separateLivenessCheck'));
    },

    removeSidekick(idx) {
      var ary = this.get('primaryService.secondaryLaunchConfigs');
      ary.removeAt(idx);
    },
  },

  init() {
    window.nec = this;
    this._super(...arguments);

    if ( !this.get('launchConfig.environmentFrom') ) {
      this.set('launchConfig.environmentFrom', []);
    }

    if ( !this.get('launchConfig.metadata') ) {
      this.set('launchConfig.metadata', {});
    }

    const service = this.get('service');

    if ( service && !service.get('scheduling') ) {
      service.set('scheduling', {
        node: {}
      });
    }

    if ( !this.get('isSidekick') ) {
      this.setProperties({
        name: this.get('service.name'),
        description: this.get('service.description'),
        scale: this.get('service.scale'),
        scheduling: this.get('service.scheduling'),
      });
    } else {
      this.setProperties({
        name: this.get('launchConfig.name'),
        description: this.get('launchConfig.description'),
      });
    }

    let namespaceId = null;
    namespaceId = this.get('service.namespaceId');

    if ( namespaceId ) {
      let namespace = this.get('clusterStore').getById('namespace', namespaceId);
      if ( namespace ) {
        this.set('namespace', namespace);
      }
    }

    if ( !get(this, 'separateLivenessCheck') ) {
      const ready = get(this, 'launchConfig.readinessProbe');
      const live = get(this, 'launchConfig.livenessProbe');
      const readyStr = JSON.stringify(ready);
      const liveStr = JSON.stringify(live);
      if ( readyStr !== liveStr ) {
        set(this,'separateLivenessCheck', true);
      }
    }

    this.labelsChanged();
  },

  didInsertElement() {
    this.$("INPUT[type='text']")[0].focus();
  },

  // ----------------------------------
  // Labels
  // ----------------------------------
  userLabels: null,

  labelsChanged: debouncedObserver(
    'userLabels.@each.{key,value}',
    function() {
      let out = flattenLabelArrays(
        this.get('userLabels'),
      );
      this.set('service.labels', out);
    }
  ),

  // ----------------------------------
  // Save
  // ----------------------------------
  validate() {
    let pr = this.get('primaryResource');
    let errors = pr.validationErrors() || [];

    (this.get('service.secondaryLaunchConfigs')||[]).forEach((slc) => {
      slc.validationErrors().forEach((err) => {
        errors.push(slc.get('displayName') + ': ' + err);
      });
    });

    // Errors from components
    errors.pushObjects(this.get('commandErrors')||[]);
    errors.pushObjects(this.get('volumeErrors')||[]);
    errors.pushObjects(this.get('networkingErrors')||[]);
    errors.pushObjects(this.get('secretsErrors')||[]);
    errors.pushObjects(this.get('readyCheckErrors')||[]);
    errors.pushObjects(this.get('liveCheckErrors')||[]);
    errors.pushObjects(this.get('schedulingErrors')||[]);
    errors.pushObjects(this.get('securityErrors')||[]);
    errors.pushObjects(this.get('scaleErrors')||[]);
    errors.pushObjects(this.get('imageErrors')||[]);
    errors.pushObjects(this.get('portErrors')||[]);
    errors.pushObjects(this.get('namespaceErrors')||[]);
    errors.pushObjects(this.get('labelErrors')||[]);
    errors.pushObjects(this.get('annotationErrors')||[]);

    errors = errors.uniq();

    if ( errors.get('length') )
    {
      this.set('errors', errors);
      return false;
    }

    this.set('errors', null);
    return true;
  },

  willSave() {
    let intl = this.get('intl');
    let pr;
    let nameResource;
    let lc = this.get('launchConfig');
    let name = (this.get('name')||'').trim().toLowerCase();
    let service = this.get('service');

    let readinessProbe = get(lc,'readinessProbe');
    if ( readinessProbe && !get(this, 'separateLivenessCheck') ) {
      const livenessProbe = readinessProbe.clone();
      set(livenessProbe, 'successThreshold', 1);
      set(lc,'livenessProbe', livenessProbe);

    }

    service.clearConfigsExcept(get(this,'scaleMode')+'Config');

    if ( this.get('isSidekick') ) {
      let errors = [];
      if ( !service ) {
        errors.push(this.get('intl').t('newContainer.errors.noSidekick'));
        this.set('errors', errors);
        return false;
      }

      if ( !name ) {
        errors.push(intl.t('validation.required', {key: intl.t('formNameDescription.name.label')}));
        this.set('errors', errors);
        return false;
      }

      pr = service.clone();
      let def = lc.serialize();
      def.type = 'secondaryLaunchConfig';
      let sidekick = this.get('store').createRecord(def);
      nameResource = sidekick;

      let slc = pr.get('secondaryLaunchConfigs');
      if ( !slc ) {
        slc = [];
        pr.set('secondaryLaunchConfigs', slc);
      }

      let lci = this.get('launchConfigIndex');
      if ( lci === undefined || lci === null ) {
        // If it's a new sidekick, add it to the end of the list
        lci = slc.length;
      }

      let duplicate = slc.find((x, idx) => {
        return idx !== lci && x.get('name').toLowerCase() === name;
      });
      if ( duplicate ) {
        errors.push(intl.t('newContainer.errors.duplicateName', {name: name, service: duplicate.get('displayName')}));
        this.set('errors', errors);
        return false;
      }

      slc[lci] = sidekick;
    } else {
      pr = service;
      nameResource = pr;
      pr.set('scale', this.get('scale'));
    }

    if ( get(this, 'isUpgrade') ) {
      const existing = pr.containers.findBy('name', name);
      if ( existing ) {
        pr.containers.removeObject(existing);
      }
    } else {
      set(pr, 'containers', []);
    }

    set(lc, 'name', name);
    pr.containers.push(lc);

    nameResource.setProperties({
      name: name,
      description: this.get('description'),
    });

    this.set('primaryResource', pr);
    this.set('originalPrimaryResource', pr);

    if ( !get(this, 'namespace.name') ) {
      errors.push(intl.t('validation.required', {key: intl.t('generic.namespace')}));
      this.set('errors', errors);
      return false;
    }

    set(pr,'namespaceId', get(this,'namespace.id')||'__placeholder__');
    const self = this;
    const sup = this._super;
    return this.applyHooks('_beforeSaveHooks').then(() => {
      set(pr, 'namespaceId', get(this,'namespace.id'));
      return this.applyHooks('_volumeHooks').then(() => {
        return false;
        return sup.apply(self, ...arguments);
      });
    });
  },

  doneSaving() {
    if ( !this.get('isUpgrade') ) {
      let scaleMode = this.get('scaleMode');
      if ( scaleMode === 'sidekick' ) {
        // Remember sidekick as service since you're not
        // likely to want to add many sidekicks in a row
        scaleMode = 'deployment';
      }
      this.set(`prefs.${C.PREFS.LAST_SCALE_MODE}`, scaleMode);
      this.set(`prefs.${C.PREFS.LAST_NAMESPACE}`, this.get('namespace.id'));
    }
    this.sendAction('done');
  },

  header: '',
  updateHeader: function() {
    let args = {};
    let k = 'newContainer.';
    k += (this.get('isUpgrade') ? 'upgrade' : 'add') + '.';
    if ( this.get('isSidekick') ) {
      let svc = this.get('service');
      if ( svc && svc.get('id') ) {
        k += 'sidekickName';
        args = {name: this.get('service.displayName')};
      } else {
        k += 'sidekick';
      }
    } else if ( this.get('isGlobal') ) {
      k += 'globalService';
    } else {
      k += 'service';
    }

    next(() => {
      if ( this.isDestroyed || this.isDestroying ) {
        return;
      }

      this.set('header', this.get('intl').t(k, args));
    });
  }.observes('isUpgrade','isSidekick','isGlobal','service.displayName','intl.locale').on('init'),

  isSidekick: equal('scaleMode','sidekick'),
});
