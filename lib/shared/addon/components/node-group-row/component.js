import Component from '@ember/component';
import {
  computed, get, observer, set, setProperties
} from '@ember/object';
import { equal } from '@ember/object/computed';
import { on } from '@ember/object/evented';
import { next } from '@ember/runloop';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { Promise } from 'rsvp';
import { coerce, minor } from 'semver';
import { INSTANCE_TYPES } from 'shared/utils/amazon';
import { DEFAULT_NODE_GROUP_CONFIG } from 'ui/models/cluster';
import layout from './template';


export default Component.extend({
  intl:        service(),
  globalStore: service(),
  layout,
  classNames:  ['row', 'mb-20'],

  instanceTypes:          INSTANCE_TYPES,
  defaultNodeGroupConfig: DEFAULT_NODE_GROUP_CONFIG,

  clusterConfig:               null,
  keyPairs:                    null,
  mode:                        null,
  model:                       null,
  nodeGroupsVersionCollection: null,
  originalCluster:             null,
  versions:                    null,
  launchTemplates:             null,
  allSelectedTemplateVersions: null,
  nodeInstanceRoles:           null,

  clusterSaving:                   false,
  clusterSaved:                    false,
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

      set(this, 'resourceTags', section);
    },
  },

  instanceType: computed('defaultNodeGroupConfig.instanceType', 'isNoLaunchTemplate', 'model.instanceType', 'selectedTemplateVersionInfo.LaunchTemplateData.InstanceType', 'selectedTemplateVersionInfo.LaunchTemplateData.InstanceMarketOptions.MarketType', {
    get() {
      let instanceType = this?.model?.instanceType;
      const { selectedTemplateVersionInfo, isNoLaunchTemplate } = this;

      if (isNoLaunchTemplate) {
        return instanceType;
      } else if (selectedTemplateVersionInfo) {
        const LaunchTemplateData = selectedTemplateVersionInfo?.LaunchTemplateData;
        const MarketType = LaunchTemplateData?.InstanceMarketOptions?.MarketType;
        const InstanceType = LaunchTemplateData?.InstanceType ? LaunchTemplateData?.InstanceType : this.defaultNodeGroupConfig.instanceType;

        if (!isEmpty(MarketType) && MarketType === 'spot') {
          return null;
        }

        return InstanceType;
      }

      return instanceType;
    },
    set(_key, instanceType) {
      const {
        selectedTemplateVersionInfo, isNoLaunchTemplate, isRancherLaunchTemplate
      } = this;

      if (isNoLaunchTemplate || isRancherLaunchTemplate) {
        set(this, 'model.instanceType', instanceType)
      } else if (selectedTemplateVersionInfo) {
        const { LaunchTemplateData: { InstanceMarketOptions: { MarketType } } } = selectedTemplateVersionInfo;

        if (!isEmpty(MarketType) && MarketType === 'spot') {
          set(this, 'model.instanceType', instanceType);
        }
      }

      return instanceType;
    }
  }),

  imageId: computed('defaultNodeGroupConfig.imageId', 'isNoLaunchTemplate', 'model.imageId', 'selectedTemplateVersionInfo.LaunchTemplateData.ImageId', {
    get() {
      let imageId = this?.model?.imageId;
      const { selectedTemplateVersionInfo, isNoLaunchTemplate } = this;

      if (isNoLaunchTemplate) {
        return imageId;
      } else if (selectedTemplateVersionInfo) {
        const { LaunchTemplateData: { ImageId = this.defaultNodeGroupConfig.imageId } } = selectedTemplateVersionInfo;

        return ImageId ?? this.defaultNodeGroupConfig.imageId;
      }

      return imageId;
    },
    set(_key, imageId) {
      const { isNoLaunchTemplate, isRancherLaunchTemplate } = this;

      if (isNoLaunchTemplate || isRancherLaunchTemplate) {
        set(this, 'model.imageId', imageId)
      }

      return imageId;
    }
  }),

  diskSize: computed('defaultNodeGroupConfig.diskSize', 'isNoLaunchTemplate', 'model.diskSize', 'selectedTemplateVersionInfo.LaunchTemplateData.BlockDeviceMappings.[]', {
    get() {
      let diskSize = this?.model?.diskSize;
      const { selectedTemplateVersionInfo, isNoLaunchTemplate } = this;

      if (isNoLaunchTemplate) {
        return diskSize;
      } else if (selectedTemplateVersionInfo) {
        const blockDeviceMappings = selectedTemplateVersionInfo?.LaunchTemplateData?.BlockDeviceMappings?.firstObject ?? {};
        const DiskSize = blockDeviceMappings?.Ebs?.VolumeSize ?? this.defaultNodeGroupConfig.diskSize;

        return DiskSize ?? this.defaultNodeGroupConfig.diskSize;
      }

      return diskSize;
    },
    set(_key, diskSize) {
      const { isNoLaunchTemplate, isRancherLaunchTemplate } = this;

      if (isNoLaunchTemplate || isRancherLaunchTemplate) {
        set(this, 'model.diskSize', diskSize)
      }

      return diskSize;
    }
  }),

  ec2SshKey: computed('defaultNodeGroupConfig.ec2SshKey', 'isNoLaunchTemplate', 'model.ec2SshKey', 'selectedTemplateVersionInfo.LaunchTemplateData.KeyName', {
    get() {
      let ec2SshKey = this?.model?.ec2SshKey;
      const { selectedTemplateVersionInfo, isNoLaunchTemplate } = this;

      if (isNoLaunchTemplate) {
        return ec2SshKey;
      } else if (selectedTemplateVersionInfo) {
        const { LaunchTemplateData: { KeyName = this.defaultNodeGroupConfig.ec2SshKey } } = selectedTemplateVersionInfo;

        return KeyName ?? this.defaultNodeGroupConfig.ec2SshKey;
      }

      return ec2SshKey;
    },
    set(_key, ec2SshKey) {
      const { isNoLaunchTemplate, isRancherLaunchTemplate } = this;

      if (isNoLaunchTemplate || isRancherLaunchTemplate) {
        set(this, 'model.ec2SshKey', ec2SshKey)
      }

      return ec2SshKey;
    }
  }),

  userData: computed('defaultNodeGroupConfig.userData', 'isNoLaunchTemplate', 'model.userData', 'selectedTemplateVersionInfo.LaunchTemplateData.UserData', {
    get() {
      let userData = this?.model?.userData;
      const { selectedTemplateVersionInfo, isNoLaunchTemplate } = this;

      if (isNoLaunchTemplate) {
        return userData;
      } else if (selectedTemplateVersionInfo) {
        let { LaunchTemplateData: { UserData = this.defaultNodeGroupConfig.userData } } = selectedTemplateVersionInfo;

        try {
          UserData = atob(UserData);
        } catch (_err) {
        }

        return UserData ?? this.defaultNodeGroupConfig.userData;
      }

      return userData;
    },
    set(_key, userData) {
      const { isNoLaunchTemplate, isRancherLaunchTemplate } = this;

      if (isNoLaunchTemplate || isRancherLaunchTemplate) {
        set(this, 'model.userData', userData)
      }

      return userData;
    }
  }),

  resourceTags: computed('defaultNodeGroupConfig.resourceTags', 'isNoLaunchTemplate', 'model.resourceTags', 'selectedTemplateVersionInfo.LaunchTemplateData.TagSpecifications.[]', {
    get() {
      let resourceTags = this?.model?.resourceTags;
      const { selectedTemplateVersionInfo, isNoLaunchTemplate } = this;

      if (isNoLaunchTemplate) {
        return resourceTags;
      } else if (selectedTemplateVersionInfo) {
        const resourceInstanceTags = ( selectedTemplateVersionInfo?.LaunchTemplateData?.TagSpecifications ?? []).findBy('ResourceType', 'instance');
        const resourceTags = {};

        (resourceInstanceTags?.Tags ?? []).forEach((tag) => set(resourceTags, get(tag, 'Key'), get(tag, 'Value')));

        return resourceTags;
      }

      return resourceTags;
    },
    set(_key, resourceTags) {
      const { isNoLaunchTemplate, isRancherLaunchTemplate } = this;

      if (isNoLaunchTemplate || isRancherLaunchTemplate) {
        set(this, 'model.resourceTags', resourceTags)
      }

      return resourceTags;
    }
  }),


  isRancherLaunchTemplate: computed('model.{launchTemplate,nodegroupName}', 'originalCluster.eksStatus.managedLaunchTemplateID', function() {
    const { originalCluster, model } = this;
    const { launchTemplate } = model;
    const eksStatus = get((originalCluster ?? {}), 'eksStatus') || {};
    const { managedLaunchTemplateID = null, managedLaunchTemplateVersions = {} } = eksStatus;
    const matchedManagedVersion = get(( managedLaunchTemplateVersions ?? {} ), this.model.nodegroupName);

    if (isEmpty(launchTemplate) && !isEmpty(managedLaunchTemplateID) && !isEmpty(matchedManagedVersion)) {
      return true;
    }

    return false;
  }),

  isUserLaunchTemplate: computed('model.launchTemplate', 'originalCluster.eksStatus.managedLaunchTemplateID', function() {
    const { model }         = this;
    const { launchTemplate } = model;

    if (!isEmpty(launchTemplate) && !isEmpty(launchTemplate?.id) && !isEmpty(launchTemplate?.version)) {
      return true;
    }

    return false;
  }),

  isNoLaunchTemplate: computed('isRancherLaunchTemplate', 'isUserLaunchTemplate', function() {
    return !this.isRancherLaunchTemplate && !this.isUserLaunchTemplate;
  }),

  filteredLaunchTemplates: computed('launchTemplates.[]', function() {
    const { launchTemplates } = this;

    if (isEmpty(launchTemplates)) {
      return [];
    }

    return launchTemplates.filter(({ LaunchTemplateName }) =>  !LaunchTemplateName.includes('rancher-managed-lt') ).sortBy('LaunchTemplateName');
  }),

  selectedTemplateVersionInfo: computed('model.launchTemplate.{id,version}', 'allSelectedTemplateVersions.[]', function() {
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

  selectedLaunchTemplateVersion: computed('model.launchTemplate.version', 'model.launchTemplate.id', {
    get() {
      return get(this, 'model.launchTemplate.version') ? get(this, 'model.launchTemplate.version').toString() : null;
    },
    set(_key, value) {
      set(this, 'model.launchTemplate.version', parseInt(value, 10));

      this.loadTemplateVersionInfo();

      return value;
    },
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
        const out = this.filteredLaunchTemplates.findBy('LaunchTemplateId', launchTemplate.id);

        return isEmpty(out) ? null : out;
      }

      return null;
    },

    set(_key, launchTemplateId) {
      const launchTemplate = this.filteredLaunchTemplates.findBy('LaunchTemplateId', launchTemplateId);
      const  {
        LaunchTemplateId: id, LaunchTemplateName: name, DefaultVersionNumber: version
      }  = launchTemplate ?? {};

      if (isEmpty(launchTemplate)) {
        set(this, 'model.launchTemplate', null);

        setProperties(this, {
          diskSize:             this.defaultNodeGroupConfig.diskSize,
          ec2SshKey:            this.defaultNodeGroupConfig.ec2SshKey,
          imageId:              this.defaultNodeGroupConfig.imageId,
          instanceType:         this.defaultNodeGroupConfig.instanceType,
          requestSpotInstances: this.defaultNodeGroupConfig.requestSpotInstances,
          resourceTags:         this.defaultNodeGroupConfig.resourceTags,
          userData:             this.defaultNodeGroupConfig.userData,
        });
      } else {
        set(this, 'model.launchTemplate', {
          id,
          name,
        });
        set(this, 'selectedLaunchTemplateVersion', version);
      }

      return launchTemplateId;
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

  showGPUWarning: computed('model.launchTemplate.{id,version}', 'selectedTemplateVersionInfo', function() {
    const { model, selectedTemplateVersionInfo } = this;
    const ltId = get(model, 'launchTemplate.id');
    const ltVersion = get(model, 'launchTemplate.version');
    const imageId = selectedTemplateVersionInfo ? get(selectedTemplateVersionInfo, 'LaunchTemplateData.ImageId') : undefined;

    return ltId && ltVersion && selectedTemplateVersionInfo && imageId;
  }),

  requestedSpotInstances: on('init', observer('model.requestSpotInstances', 'selectedTemplateVersionInfo.LaunchTemplateData.InstanceMarketOptions.MarketType', function() {
    const { model } = this;

    if (get(model, 'requestSpotInstances')) {
      set(this, 'instanceType', null);
    } else if (!get(model, 'requestSpotInstances') && get(model, 'instanceType') === null) {
      set(this, 'instanceType', 't3.medium');
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

  nodeRoleOptions: computed('intl', 'nodeInstanceRoles.[]', function(){
    const { nodeInstanceRoles } = this;

    return [{
      RoleName: this.intl.t('nodeGroupRow.nodeInstanceRole.defaultOption'),
      RoleId:   ''
    }, ...nodeInstanceRoles]
  }),

  selectedNodeRoleName: computed('model.nodeRole', 'nodeInstanceRoles.[]', function(){
    const { nodeInstanceRoles } = this;
    const { nodeRole } = this.model

    const selected = nodeInstanceRoles.findBy('Arn', nodeRole )

    return selected ? selected.RoleName : null
  } ),

  async loadTemplateVersionInfo() {
    if (!this.clusterSaving && !this.clusterSaved) {
      const { launchTemplate = {} } = this.model;
      let defaults = { ...this.defaultNodeGroupConfig };

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
            instanceType: get(launchTemplateData, 'InstanceType') ?? this.defaultNodeGroupConfig.instanceType,
            diskSize:     get(launchTemplateData, 'BlockDeviceMappings.firstObject.Ebs.VolumeSize') ?? this.defaultNodeGroupConfig.diskSize,
            ec2SshKey:    get(launchTemplateData, 'KeyName') ?? null,
            userData:     isEmpty(get(launchTemplateData, 'UserData')) ? null : atob(get(launchTemplateData, 'UserData')),
          };


          defaults = Object.assign({}, defaults, overrides);

          if (get(launchTemplateData, 'InstanceMarketOptions.MarketType') && get(launchTemplateData, 'InstanceMarketOptions.MarketType') === 'spot') {
            set(defaults, 'requestSpotInstances', true);
            set(this, 'instanceType', null);
          }

          if ( !isEmpty(get(launchTemplateData, 'TagSpecifications')) ) {
            const resourceInstanceTags = get(launchTemplateData, 'TagSpecifications').findBy('ResourceType', 'instance');

            if (!isEmpty(resourceInstanceTags) && !isEmpty(get(resourceInstanceTags, 'Tags'))) {
              set(defaults, 'resourceTags', {});

              resourceInstanceTags.Tags.forEach((tag) => set(defaults.resourceTags, get(tag, 'Key'), get(tag, 'Value')));
            }
          }

          set(this, 'refreshResourceInstanceTags', false);

          next(() =>  {
            setProperties(this.model, defaults);

            set(this, 'allSelectedTemplateVersions', versions);
            set(this, 'refreshResourceInstanceTags', true)
          } );
        } catch (err) { }
      }
    }
  },

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
