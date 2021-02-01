import Component from '@ember/component';
import layout from './template';
import { INSTANCE_TYPES } from 'shared/utils/amazon';
import {
  get, set, setProperties, observer, computed
} from '@ember/object';
import { on } from '@ember/object/evented';
import { equal } from '@ember/object/computed';
import { isEmpty } from '@ember/utils';
import { inject as service } from '@ember/service';
import { Promise } from 'rsvp';
import { next } from '@ember/runloop';
import { DEFAULT_NODE_GROUP_CONFIG } from 'ui/models/cluster';

import { coerce, minor } from 'semver';

export default Component.extend({
  globalStore: service(),
  layout,
  classNames:  ['row', 'mb-20'],

  instanceTypes: INSTANCE_TYPES,

  clusterConfig:               null,
  keyPairs:                    null,
  mode:                        null,
  model:                       null,
  nodeGroupsVersionCollection: null,
  originalCluster:             null,
  versions:                    null,
  launchTemplates:             null,
  allSelectedTemplateVersions: null,

  nameIsEditable:                  true,
  showNodeUpgradePreventionReason: false,
  upgradeVersion:                  false,
  refreshResourceInstanceTags:     true, // simply used for reinit'ing the resource instance tags key value component rather than add weird logic to recomput to the component


  editing: equal('mode', 'edit'),

  init() {
    this._super(...arguments);
    if (!this.launchTemplates) {
      set(this, 'launchTemplates', []);
    }

    if (this.editing) {
      if (!isEmpty(this.model.nodegroupName)) {
        set(this, 'nameIsEditable', false);
      }
    }
  },

  actions: {
    setTags(section) {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }

      set(this, 'model.tags', section);
    },

    setLabels(section) {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }
      set(this, 'model.labels', section);
    },

    setResourceTags(section) {
      if (this.isDestroyed || this.isDestroying) {
        return;
      }

      set(this, 'model.resourceTags', section);
    },
  },

  loadTemplateVersionInfo: observer('model.launchTemplate.{id,version}', async function() {
    const { launchTemplate = {} } = this.model;
    let defaults = { ...DEFAULT_NODE_GROUP_CONFIG };

    // in this case we dont want the defaults for nodegroup items
    delete defaults.nodegroupName;
    delete defaults.maxSize;
    delete defaults.minSize;
    delete defaults.desiredSize;


    if (isEmpty(launchTemplate)) {
      set(this, 'refreshResourceInstanceTags', false);

      next(() => {
        setProperties(this.model, defaults);
        set(this, 'refreshResourceInstanceTags', true)
      });
    } else if ( !isEmpty(get(launchTemplate, 'id')) ) {
      try {
        const versions = await this.listTemplateVersions();
        const match = versions.findBy('VersionNumber', parseInt(launchTemplate.version, 10)); // newselect doesn't handle numbers as values very well
        const { LaunchTemplateData: launchTemplateData } = match;

        const overrides = {
          imageId:      get(launchTemplateData, 'ImageId') ?? null,
          instanceType: get(launchTemplateData, 'InstanceType') ?? 't3.medium',
          volumeSize:   get(launchTemplateData, 'BlockDeviceMappings.Ebs.VolumeSize') ?? 20,
          sshKey:       get(launchTemplateData, 'KeyName') ?? null,
          userData:     isEmpty(get(launchTemplateData, 'UserData')) ? null : atob(get(launchTemplateData, 'UserData')),
        };


        defaults = Object.assign({}, defaults, overrides);

        if (get(launchTemplateData, 'InstanceMarketOptions.MarketType') && get(launchTemplateData, 'InstanceMarketOptions.MarketType') === 'spot') {
          set(defaults, 'requestSpotInstances', true);
        }

        if ( !isEmpty(get(launchTemplateData, 'TagSpecifications')) ) {
          const resourceInstanceTags = get(launchTemplateData, 'TagSpecifications').findBy('ResourceType', 'instance');

          if (!isEmpty(resourceInstanceTags) && !isEmpty(get(resourceInstanceTags, 'Tags'))) {
            set(defaults, 'resourceTags', {});

            resourceInstanceTags.Tags.forEach((tag) => set(defaults.resourceTags, get(tag, 'Key'), get(tag, 'Value')));
          }
        }

        // if ( !isEmpty(get(launchTemplateData, 'NetworkInterfaces')) ) {
        //   const subnets = [];
        //   const interfaces = get(launchTemplateData, 'NetworkInterfaces');

        //   interfaces.forEach((enterface) => subnets.push(get(enterface, 'SubnetId')))
        // }

        set(this, 'refreshResourceInstanceTags', false);

        next(() =>  {
          setProperties(this.model, defaults);
          console.log(this.model);

          set(this, 'allSelectedTemplateVersions', versions);
          set(this, 'refreshResourceInstanceTags', true)
        } );
      } catch (err) { }
    }
  }),

  isRancherLaunchTemplate: computed('model.launchTemplate', function() {
    const { originalCluster } = this;
    const { launchTemplate } = this.model;
    const {
      name, id, version
    } = (launchTemplate ?? {});
    const eksStatus = get((originalCluster ?? {}), 'eksStatus') || {};

    if ((launchTemplate === null || name === null && id === null && version === null) &&
        !isEmpty(get(eksStatus, 'managedLaunchTemplateID'))
    ) {
      return true;
    }

    return false;
  }),

  filteredLaunchTemplates: computed('launchTemplates.[]', function() {
    const { launchTemplates } = this;

    if (isEmpty(launchTemplates)) {
      return [];
    }

    return launchTemplates.filter(({ LaunchTemplateName }) =>  !LaunchTemplateName.includes('rancher-managed-lt') ).map(({
      LaunchTemplateName, LaunchTemplateId, DefaultVersionNumber
    }) => {
      return {
        label: LaunchTemplateName,
        value:    {
          id:             LaunchTemplateId,
          name:           LaunchTemplateName,
          defaultVersion: DefaultVersionNumber,
        },
      };
    }).sortBy('label');
  }),

  selectedTemplateVersion: computed('model.launchTemplate.{id,version}', 'allSelectedTemplateVersions.[]', function() {
    const { model, allSelectedTemplateVersions } = this;
    const version = get(model, 'launchTemplate.version');

    if (isEmpty(model.launchTemplate) || isEmpty(version)) {
      return null;
    }

    const match = (allSelectedTemplateVersions || []).findBy('VersionNumber', parseInt(version, 10));

    if (match) {
      return match;
    }

    return null;
  }),

  selectedLaunchTemplateVersions: computed('model.launchTemplate.{id,name,version}', 'launchTemplates', function() {
    const { model, launchTemplates } = this;
    const { launchTemplate } = model;

    if (isEmpty(launchTemplate) || isEmpty(get(launchTemplate, 'id'))) {
      return [];
    }

    const match = launchTemplates.findBy('LaunchTemplateId', launchTemplate.id);

    if (match) {
      // this lets us create a range of values 1...XX because the launch template only gives us the 1st and latest numbers but we want all for the version select
      // ++ver -> zero based array so we need to +1 that value to match a non-zero based version number system
      return Array.from(Array(match.LatestVersionNumber).keys()).map((ver) => ({ label: `${ ++ver }` }));
    }

    return [];
  }),

  selectedLaunchTemplate: computed('model.launchTemplate', 'filteredLaunchTemplates.[]', {
    get() {
      const launchTemplate = get(this, 'model.launchTemplate') ?? false;

      if (launchTemplate) {
        const out = this.filteredLaunchTemplates.findBy('value.id', launchTemplate.id);

        return isEmpty(out) ? null : get(out, 'value');
      }

      return null;
    },

    set(key, value) {
      const  {
        id, name, defaultVersion: version
      }  = value ?? {};

      if (isEmpty(value)) {
        set(this, 'model.launchTemplate', null);
      } else {
        set(this, 'model.launchTemplate', {
          id,
          name,
          version
        });
      }

      return value;
    }
  }),

  creating: computed('mode', function() {
    const {
      mode, originalCluster, model: { nodegroupName }
    } = this;

    if (mode === 'new') {
      return true;
    }

    const upstreamSpec = get(originalCluster, 'eksStatus.upstreamSpec');
    const nodeGroups = upstreamSpec ? get(upstreamSpec, 'nodeGroups') : [];

    if (nodegroupName && nodeGroups.length >= 1) {
      if (nodeGroups.findBy('nodegroupName', nodegroupName)) {
        return false;
      }
    }

    return true;
  }),

  originalClusterVersion: computed('originalCluster.eksConfig.kubernetesVersion', 'originalCluster.eksStatus.upstreamSpec.kubernetesVersion', function() {
    if (!isEmpty(get(this, 'originalCluster.eksConfig.kubernetesVersion'))) {
      return get(this, 'originalCluster.eksConfig.kubernetesVersion');
    }

    if (!isEmpty(get(this, 'originalCluster.eksStatus.upstreamSpec.kubernetesVersion'))) {
      return get(this, 'originalCluster.eksStatus.upstreamSpec.kubernetesVersion');
    }

    return '';
  }),

  upgradeAvailable: computed('clusterConfig.kubernetesVersion', 'mode', 'model.version', 'originalClusterVersion', 'showNodeUpgradePreventionReason', function() {
    const originalClusterVersion = get(this, 'originalClusterVersion');
    const clusterVersion         = get(this, 'clusterConfig.kubernetesVersion');
    const nodeVersion            = get(this, 'model.version');
    const mode                   = get(this, 'mode');

    const initalClusterMinorVersion = parseInt(minor(coerce(clusterVersion)), 10);
    const initalNodeMinorVersion   = parseInt(minor(coerce(nodeVersion)), 10);
    const diff                     = initalClusterMinorVersion - initalNodeMinorVersion;

    if (mode === 'edit') {
      // we must upgrade the cluster first
      if (originalClusterVersion !== clusterVersion) {
        set(this, 'showNodeUpgradePreventionReason', true);

        return false;
      }
    }

    if (diff === 0 && get(this, 'showNodeUpgradePreventionReason')) {
      set(this, 'showNodeUpgradePreventionReason', false);
    }

    return diff === 1;
  }),

  showGPUWarning: computed('model.launchTemplate.{id,version}', 'selectedTemplateVersion', function() {
    const { model, selectedTemplateVersion } = this;
    const ltId = get(model, 'launchTemplate.id');
    const ltVersion = get(model, 'launchTemplate.version');
    const imageId = selectedTemplateVersion ? get(selectedTemplateVersion, 'LaunchTemplateData.ImageId') : undefined;

    return ltId && ltVersion && selectedTemplateVersion && imageId;
  }),

  requestedSpotInstances: on('init', observer('model.requestSpotInstances', function() {
    const { model } = this;

    if (get(model, 'requestSpotInstances')) {
      set(this, 'model.instanceType', null);
    } else if (!get(model, 'requestSpotInstances') && get(model, 'instanceType') === null) {
      set(this, 'model.instanceType', 't3.medium');
    }
  })),

  clusterVersionDidChange: on('init', observer('clusterConfig.kubernetesVersion', function() {
    const { clusterConfig, editing } = this;

    if (get(clusterConfig, 'kubernetesVersion') && !editing) {
      set(this, 'model.version', clusterConfig.kubernetesVersion);
    }
  })),

  shouldUpgradeVersion: on('init', observer('upgradeVersion', function() {
    const { upgradeVersion } = this;
    const clusterVersion           = get(this, 'clusterConfig.kubernetesVersion');
    const nodeVersion              = get(this, 'model.version');

    if (upgradeVersion && clusterVersion !== nodeVersion) {
      set(this, 'model.version', clusterVersion);
    }
  })),

  listTemplateVersions() {
    const { launchTemplate } = this.model;
    const match = this.launchTemplates.findBy('LaunchTemplateId', launchTemplate.id);

    return new Promise((resolve, reject) => {
      const ec2 = new AWS.EC2(this.authCreds());

      const maxVersion = match.LatestVersionNumber;

      ec2.describeLaunchTemplateVersions({
        LaunchTemplateId: launchTemplate.id,
        MaxVersion:       maxVersion.toString(),
        MinVersion:       '1',
      }, (err, data) => {
        if (err) {
          console.log(err, err.stack);
          reject(err);
        }

        resolve(data.LaunchTemplateVersions);
      });
    })
  },

  removeNodeGroup() {
    throw new Error('remove node group action is required!');
  },

});
