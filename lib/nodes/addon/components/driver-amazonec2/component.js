import $ from 'jquery';
import { scheduleOnce } from '@ember/runloop';
import EmberObject, {
  observer, computed, get, set, setProperties
} from '@ember/object';
import { Promise, resolve } from 'rsvp';
import { alias, equal } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import layout from './template';
import { INSTANCE_TYPES, nameFromResource, tagsFromResource, REGIONS } from 'shared/utils/amazon';
import { randomStr } from 'shared/utils/util';
import { isEmpty } from '@ember/utils';

let RANCHER_GROUP         = 'rancher-nodes';


export default Component.extend(NodeDriver, {
  prefs: service(),
  intl:  service(),

  layout,
  model: null,

  driverName:               'amazonec2',
  clients:                  null,
  allSubnets:               null,
  allSecurityGroups:        null,
  selectedSecurityGroup:    null,
  defaultSecurityGroup:     null,
  allKmsKeys:               null,
  defaultSecurityGroupName: RANCHER_GROUP,
  whichSecurityGroup:       'default',
  instanceTypes:            INSTANCE_TYPES,
  regionChoices:            REGIONS,
  step:                     1,
  tags:                     null,
  editing:                  false,
  loadFailedKmsKeys:        false,

  config: alias('model.amazonec2Config'),

  isCustomSecurityGroup:    equal('whichSecurityGroup', 'custom'),

  init() {
    this._super(...arguments);

    setProperties(this, {
      allKmsKeys: [],
      allSubnets: [],
      clients:    {},
    });

    let cur = get(this, 'config.securityGroup');

    if ( cur === '' ) { // TODO 2.0 should this be null 403 Vince/Wes/Daishan
      setProperties(this, {
        whichSecurityGroup:    'default',
        selectedSecurityGroup: null,
      });
    } else {
      setProperties(this, {
        whichSecurityGroup:    'custom',
        selectedSecurityGroup: cur,
      });
    }

    const tagsString = get(this, 'config.tags');

    if ( tagsString ) {
      const array = tagsString.split(',');
      const tags = {};

      for (let i = 0; i < array.length - 1; i = i + 2) {
        tags[array[i]] = array[i + 1];
      }

      set(this, 'tags', tags);
    }

    if (isEmpty(get(this, 'config.httpEndpoint'))) {
      set(this, 'config.httpEndpoint', 'enabled');
    }

    if (isEmpty(get(this, 'config.httpTokens'))) {
      set(this, 'config.httpTokens', 'optional');
    }
  },

  willDestroyElement() {
    setProperties(this, {
      step:               1,
      machineId:          null,
      clients:            null,
      allSubnets:         null,
      allSecurityGroups:  null,
      whichSecurityGroup: 'default',
    });
  },

  actions: {
    finishAndSelectCloudCredential(cred) {
      if (cred) {
        set(this, 'primaryResource.cloudCredentialId', get(cred, 'id'));

        this.send('awsLogin');
      }
    },

    async awsLogin(cb) {
      let self = this;

      set(this, 'errors', null);

      let subnets = [];
      let rName = get(this, 'config.region');
      const auth = {
        accessKeyId:         randomStr(),
        secretAccessKey:     randomStr(),
        region:              rName,
        httpOptions:         { cloudCredentialId: get(this, 'model.cloudCredentialId') },
      };

      await this.loadKMSKeys(auth);

      // have to have something in there before we describe the request even though we are going to replace with the actual cred id
      let ec2 = new AWS.EC2(auth);

      let vpcNames = {};
      let vpcTags = {};

      ec2.describeVpcs({}, (err, vpcs) => {
        if ( err ) {
          let errors = get(self, 'errors') || [];

          errors.pushObject(err);
          set(this, 'errors', errors);
          if (cb && typeof cb === 'function') {
            cb();
          }

          return;
        }

        vpcs.Vpcs.forEach((vpc) => {
          vpcNames[vpc.VpcId] = nameFromResource(vpc, 'VpcId');
          vpcTags[vpc.VpcId] = tagsFromResource(vpc);
        });

        ec2.describeSubnets({}, (err, data) => {
          if ( err ) {
            let errors = get(self, 'errors') || [];

            errors.pushObject(err);
            set(this, 'errors', errors);
            if (cb && typeof cb === 'function') {
              cb();
            }

            return;
          }

          set(this, `clients.${ rName }`, ec2);

          data.Subnets.forEach((subnet) => {
            if ( (subnet.State || '').toLowerCase() !== 'available' ) {
              return;
            }

            subnets.pushObject(EmberObject.create({
              subnetName: nameFromResource(subnet, 'SubnetId'),
              subnetId:   subnet.SubnetId,
              subnetTags: tagsFromResource(subnet),
              vpcName:    vpcNames[subnet.VpcId] || subnet.VpcId,
              vpcId:      subnet.VpcId,
              vpcTags:    vpcTags[subnet.VpcId] || [],
              zone:       subnet.AvailabilityZone,
              region:     rName
            }));
          });

          setProperties(this, {
            'allSubnets': subnets,
            'step':       2,
          });
          if (cb && typeof cb === 'function') {
            cb();
          }
        });
      });
    },

    selectSubnet(cb) {
      set(this, 'errors', null);

      if ( !get(this, 'selectedZone') ) {
        set(this, 'errors', ['Select an Availability Zone']);
        if (cb && typeof cb === 'function') {
          cb();
        }

        return;
      }

      if ( !get(this, 'selectedSubnet') ) {
        set(this, 'errors', ['Select a VPC or Subnet']);
        if (cb && typeof cb === 'function') {
          cb();
        }

        return;
      }

      let ec2    = get(this, `clients.${ get(this, 'config.region') }`);
      let filter = {
        Name:   'vpc-id',
        Values: [get(this, 'config.vpcId')]
      };

      ec2.describeSecurityGroups({ Filters: [filter] }, (err, data) => {
        if ( err ) {
          set(this, 'errors', [err]);
          if (cb && typeof cb === 'function') {
            cb();
          }

          return;
        }

        let groups = [];

        data.SecurityGroups.forEach((group) => {
          let tags = {};

          // Skip launch-wizard groups
          if ( (group.GroupName || '').match(/^launch-wizard-.*$/) ) {
            return;
          }

          (group.Tags || []).forEach((tag) => {
            tags[tag.Key] = tag.Value;
          });

          let obj = {
            id:          group.GroupId,
            name:        group.GroupName,
            description: group.Description,
          };

          groups.push(obj);
        });

        setProperties(this, {
          allSecurityGroups: groups,
          step:              3,
        });
      });
    },

    multiSecurityGroupSelect() {
      let options = Array.prototype.slice.call($('.existing-security-groups')[0], 0);
      let selectedOptions = [];

      options.filterBy('selected', true).forEach((cap) => {
        return selectedOptions.push(cap.value);
      });

      set(this, 'selectedSecurityGroup', selectedOptions);
    },

    selectSecurityGroup(cb) {
      set(this, 'errors', null);

      if ( get(this, 'isCustomSecurityGroup') ) {
        set(this, 'config.securityGroup', get(this, 'selectedSecurityGroup'));
      } else {
        set(this, 'config.securityGroup', '');
      }

      setProperties(this, { step: 4, });

      if (cb && typeof cb === 'function') {
        cb();
      }
    },
  },

  resetKms: observer('config.encryptEbsVolume', function() {
    if (!get(this, 'config.encryptEbsVolume')) {
      set(this, 'config.kmsKey', null);
    }
  }),

  tagsDidChange: observer('tags', function() {
    const array = [];
    const tags = get(this, 'tags') || {};

    Object.keys(tags).forEach((key) => {
      array.push(key);
      array.push(tags[key]);
    });

    set(this, 'config.tags', array.join(','));
  }),

  stepDidChange: observer('context.step', function() {
    scheduleOnce('afterRender', this, () => {
      document.body.scrollTop = document.body.scrollHeight;
    });
  }),

  selectedZone: computed('config.{region,zone}', {
    get() {
      let config = get(this, 'config');

      if ( get(config, 'region') && get(config, 'zone') ) {
        return get(config, 'region') + get(config, 'zone');
      } else {
        return null;
      }
    },

    set(key, val) {
      let config = get(this, 'config');

      setProperties(config, {
        region: val.substr(0, val.length - 1),
        zone:   val.substr(val.length - 1),
      });

      let selectedSubnet = get(this, 'selectedSubnet');

      if ( get(this, 'subnetChoices').filterBy('value', selectedSubnet).length === 0 ) {
        setProperties(config, {
          region:   val.substr(0, val.length - 1),
          zone:     val.substr(val.length - 1),
          vpcId:    null,
          subnetId: null,
        });
      }

      if ( get(config, 'region') && get(config, 'zone') ) {
        return get(config, 'region') + get(config, 'zone');
      } else {
        return null;
      }
    }
  }),

  zoneChoices: computed('allSubnets.@each.{zone}', function() {
    const choices = (get(this, 'allSubnets') || []).map((subnet) => {
      return get(subnet, 'zone');
    }).sort().uniq();

    if ( choices.length ) {
      if ( get(this, 'config.zone.length') ) {
        set(this, 'selectedZone', `${ get(this, 'config.region') }${ get(this, 'config.zone') }`);
      } else {
        set(this, 'selectedZone', choices[0]);
      }
    }

    return choices;
  }),

  subnetChoices: computed('selectedZone', 'allSubnets.@each.{subnetId,vpcId,zone}', function() {
    let out      = [];
    let seenVpcs = [];

    (get(this, 'allSubnets') || []).filterBy('zone', get(this, 'selectedZone')).forEach((subnet) => {
      let vpcName    = get(subnet, 'vpcName');
      let vpcId      = get(subnet, 'vpcId');
      let vpcTags    = get(subnet, 'vpcTags');
      let subnetId   = get(subnet, 'subnetId');
      let subnetName = get(subnet, 'subnetName');
      let subnetTags = get(subnet, 'subnetTags');

      if ( seenVpcs.indexOf(vpcId) === -1 ) {
        seenVpcs.pushObject(vpcId);
        out.pushObject({
          sortKey: vpcId,
          label:   vpcName,
          value:   vpcId,
          isVpc:   true,
          tags:    vpcTags
        });
      }

      out.pushObject({
        sortKey: `${ vpcId } ${ subnetName }`,
        label:   subnetName,
        value:   subnetId,
        isVpc:   false,
        tags:    subnetTags
      });
    });

    return out.sortBy('sortKey');
  }),

  selectedSubnet: computed('config.{subnetId,vpcId}', {
    set(key, val) {
      let config = get(this, 'config');

      if ( arguments.length > 1 ) {
        if ( val && val.length ) {
          if ( val.indexOf('vpc-') === 0 ) {
            setProperties(config, {
              vpcId:    val,
              subnetId: null,
            });
          } else {
            let subnet = this.subnetById(val);

            setProperties(config, {
              vpcId:    subnet.vpcId,
              subnetId: subnet.subnetId,
            });
          }
        } else {
          setProperties(config, {
            vpcId:    null,
            subnetId: null,
          });
        }
      }

      return get(config, 'subnetId') || get(config, 'vpcId');
    },

    get() {
      let config = get(this, 'config');

      return get(config, 'subnetId') || get(config, 'vpcId');
    },
  }),

  bootstrap() {
    let config = get(this, 'globalStore').createRecord({
      type:          'amazonec2Config',
      region:        'us-west-2',
      instanceType:  't2.medium',
      securityGroup: '',
      zone:          'a',
      rootSize:      '16',
    });

    set(this, 'model.amazonec2Config', config);
  },

  validate() {
    let errors = [];

    if ( !get(this, 'model.name') ) {
      errors.push(this.intl.t('nodeDriver.nameError'));
    }

    if (!this.validateCloudCredentials()) {
      errors.push(this.intl.t('nodeDriver.cloudCredentialError'))
    }

    set(this, 'errors', errors);

    return errors.length === 0;
  },

  subnetById(id) {
    return (get(this, 'allSubnets') || []).filterBy('subnetId', id)[0];
  },

  async loadKMSKeys(auth) {
    try {
      const kmsKeys = await this.listKMSKeys(auth)

      return resolve(set(this, 'allKmsKeys', kmsKeys));
    } catch (err) {
      console.warn('Unable to load KMS Keys.', err); // eslint-disable-line
      // node template owners MAY not have access to KMS keys via IAM so dont kill everything because they dont
      // its not required
      set(this, 'loadFailedKmsKeys', true);

      return resolve();
    }
  },

  listKMSKeys(auth) {
    return new Promise((resolve, reject) => {
      const KMS = new AWS.KMS(auth);

      KMS.listKeys({}, (err, data) => {
        if (err) {
          console.error(err, err.stack);

          return reject(err);
        }

        return resolve(data.Keys);
      });
    });
  },


});
