import { equal } from '@ember/object/computed';
import { next } from '@ember/runloop';
import { resolve, reject, all } from 'rsvp';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NewOrEdit from 'shared/mixins/new-or-edit';
import { debouncedObserver } from 'ui/utils/debounce';
import C from 'ui/utils/constants';
import { flattenLabelArrays } from 'shared/mixins/manage-labels';
import layout from './template';

export default Component.extend(NewOrEdit, {
  layout,
  intl: service(),
  prefs: service(),
  settings: service(),

  tagName: 'form',

  isService:                  false,
  isUpgrade:                  false,
  service:                    null,
  launchConfig:               null,
  containerName:              null,

  namespace:                  null,
  scale:                      1,
  mode:                       null,

  serviceLinksArray:          null,
  isRequestedHost:            null,
  upgradeOptions:             null,
  volumesToCreate:            null,

  // Errors from components
  commandErrors:              null,
  volumeErrors:               null,
  networkingErrors:           null,
  secretsErrors:              null,
  healthCheckErrors:          null,
  schedulingErrors:           null,
  securityErrors:             null,
  scaleErrors:                null,
  imageErrors:                null,
  portErrors:                 null,
  namespaceErrors:            null,
  metadataErrors:             null,

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

    removeSidekick(idx) {
      var ary = this.get('primaryService.secondaryLaunchConfigs');
      ary.removeAt(idx);
    },
  },

  init() {
    window.nec = this;
    this._super(...arguments);

    if ( !this.get('launchConfig.secrets') ) {
      this.set('launchConfig.secrets', []);
    }

    if ( !this.get('launchConfig.metadata') ) {
      this.set('launchConfig.metadata', {});
    }

    const service = this.get('service');
    if ( service && !service.get('deploymentStrategy') ) {
      service.set('deploymentStrategy', {
        kind: 'parallel',
      });
    }

    if ( this.get('isService') && !this.get('isSidekick') ) {
      this.setProperties({
        name: this.get('service.name'),
        description: this.get('service.description'),
        scale: this.get('service.scale'),
      });
    } else {
      this.setProperties({
        name: this.get('launchConfig.name'),
        description: this.get('launchConfig.description'),
      });
    }

    let namespaceId = null;
    if ( this.get('isService') ) {
      namespaceId = this.get('service.namespaceId');
    } else {
      namespaceId = this.get('launchConfig.namespaceId');
    }

    if ( namespaceId ) {
      let namespace = this.get('store').getById('namespace', namespaceId);
      if ( namespace ) {
        this.set('namespace', namespace);
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
  securityLabels: null,
  commandLabels: null,
  schedulingLabels: null,
  networkingLabels: null,

  labelsChanged: debouncedObserver(
    'userLabels.@each.{key,value}',
    'securityLabels.@each.{key,value}',
    'commandLabels.@each.{key,value}',
    'schedulingLabels.@each.{key,value}',
    'networkingLabels.@each.{key,value}',
    function() {
      let out = flattenLabelArrays(
        this.get('userLabels'),
        this.get('securityLabels'),
        this.get('commandLabels'),
        this.get('schedulingLabels'),
        this.get('networkingLabels')
      );

      var config = this.get('launchConfig');
      if ( config )
      {
        this.set('launchConfig.labels', out);
      }
    }
  ),

  // ----------------------------------
  // Save
  // ----------------------------------
  validate() {
    let pr = this.get('primaryResource');
    let errors = pr.validationErrors() || [];

    if ( this.get('isService') )
    {
      (this.get('service.secondaryLaunchConfigs')||[]).forEach((slc) => {
        slc.validationErrors().forEach((err) => {
          errors.push(slc.get('displayName') + ': ' + err);
        });
      });
    }

    // Errors from components
    errors.pushObjects(this.get('commandErrors')||[]);
    errors.pushObjects(this.get('volumeErrors')||[]);
    errors.pushObjects(this.get('networkingErrors')||[]);
    errors.pushObjects(this.get('secretsErrors')||[]);
    errors.pushObjects(this.get('healthCheckErrors')||[]);
    errors.pushObjects(this.get('schedulingErrors')||[]);
    errors.pushObjects(this.get('securityErrors')||[]);
    errors.pushObjects(this.get('scaleErrors')||[]);
    errors.pushObjects(this.get('imageErrors')||[]);
    errors.pushObjects(this.get('portErrors')||[]);
    errors.pushObjects(this.get('namespaceErrors')||[]);
    errors.pushObjects(this.get('metadataErrors')||[]);

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
    let lc = this.get('launchConfig').clone();
    let name = (this.get('name')||'').trim().toLowerCase();


    if ( this.get('isSidekick') ) {
      let service = this.get('service');
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

      debugger;
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
    } else if ( this.get('isService') ) {
      pr = this.get('service').clone();
      nameResource = pr;
      pr.get('containers')[this.get('containerName')] = lc;
      pr.set('scale', this.get('scale'));
    } else {
      // Convert the workload config to a pod
      let obj = this.get('service').serialize();
      obj.type = 'pod';
      pr = this.get('store').createRecord(obj);
      nameResource = pr;
    }

    pr.containers[this.get('name')] = this.get('launchConfig').clone();

    nameResource.setProperties({
      name: this.get('name'),
      description: this.get('description'),
    });

    this.set('primaryResource', pr);
    this.set('originalPrimaryResource', pr);

    let ok = this.validate();
    return ok;
  },

  doSave() {
    let pr = this.get('primaryResource');

    let namespacePromise = resolve();
    if ( !this.get('isUpgrade') ) {
      // Set the namespace ID
      if ( this.get('namespace.id') ) {
        pr.set('namespaceId', this.get('namespace.id'));
      } else if ( this.get('namespace') ) {
        namespacePromise = this.get('namespace').save().then((newNamespace) => {
          pr.set('namespaceId', newNamespace.get('id'));
        });
      } else {
        // This shouldn't happen since willSave checked it...
        return reject('No Namespace');
      }
    }

    let self = this;
    let sup = self._super;

    return namespacePromise.then(() => {
      let volumes = this.get('volumesToCreate');
      let volumesPromise = resolve();

      if ( volumes && volumes.get('length') ) {
        volumesPromise = all(volumes.map((volume) => {
          volume.set('namespaceId', this.get('namespace.id'));
          return volume.save();
        }));
      }

      return volumesPromise.then(() => {
        if ( this.get('isUpgrade') && !this.get('isService') ) {
          // Container upgrade
          return this.get('launchConfig').doAction('upgrade', {config: this.get('launchConfig')});
        } else {
          // Container create or Service create/upgrade
          return sup.apply(self,arguments);
        }
      });
    });
  },

  doneSaving() {
    if ( !this.get('isUpgrade') ) {
      let mode = this.get('mode');
      if ( mode === 'sidekick' ) {
        // Remember sidekick as service since you're not
        // likely to want to add many sidekicks in a row
        mode = 'service';
      }
      this.set(`prefs.${C.PREFS.LAST_SCALE_MODE}`, mode);
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
    } else if ( this.get('isService') ) {
      k += 'service';
    } else {
      k += 'container';
    }

    next(() => {
      this.set('header', this.get('intl').t(k, args));
    });
  }.observes('isUpgrade','isService','isSidekick','isGlobal','service.displayName','intl.locale').on('init'),

  supportsSecrets: function() {
    return !!this.get('store').getById('schema','secret');
  }.property(),

  isSidekick: equal('mode','sidekick'),
});
