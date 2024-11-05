import { alias, equal } from '@ember/object/computed';
import Driver from 'shared/mixins/node-driver';
import { get, set } from '@ember/object';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';
import Component from '@ember/component';
import { on } from '@ember/object/evented';
import layout from './template';
import { eachSeries } from 'async';

let RANCHER_GROUP = 'rancher-machine';
let DEFAULT_TEMPLATE = 'Linux Ubuntu 16.04 LTS 64-bit';
let DEFAULT_ZONE = 'ch-dk-2';
let RANCHER_INGRESS_RULES = [
  {
    startport: 22,
    endport:   22,
    cidrlist:  '0.0.0.0/0',
    protocol:  'TCP'
  },
  {
    startport: 80,
    endport:   80,
    cidrlist:  '0.0.0.0/0',
    protocol:  'TCP'
  },
  {
    startport: 443,
    endport:   443,
    cidrlist:  '0.0.0.0/0',
    protocol:  'TCP'
  },
  {
    startport: 2376,
    endport:   2376,
    cidrlist:  '0.0.0.0/0',
    protocol:  'TCP'
  },
  {
    startport: 8472,
    endport:   8472,
    cidrlist:  '0.0.0.0/0',
    protocol:  'UDP'
  },
  {
    startport: 10250,
    endport:   10250,
    cidrlist:  '0.0.0.0/0',
    protocol:  'TCP'
  },
  {
    startport: 30000,
    endport:   32767,
    cidrlist:  '0.0.0.0/0',
    protocol:  'TCP'
  },
  {
    startport: 30000,
    endport:   32767,
    cidrlist:  '0.0.0.0/0',
    protocol:  'UDP'
  },
  {
    startport: 6443,
    endport:   6443,
    cidrlist:  '0.0.0.0/0',
    protocol:  'TCP'
  },
  {
    icmptype: 8,
    icmpcode: 0,
    cidrlist: '0.0.0.0/0',
    protocol: 'ICMP'
  }
];

export default Component.extend(Driver, {
  layout,
  driverName:          'exoscale',
  model:               null,
  step:                1,

  allInstanceProfiles: null,
  allTemplates:        null,

  allZones:                 null,
  selectedZone:             null,
  defaultZone:              DEFAULT_ZONE,
  defaultSecurityGroup:     RANCHER_GROUP,
  allSecurityGroups:        [],
  securityGroup:            [],
  whichSecurityGroup:       'default',
  exoscaleApi:              'api.exoscale.ch/compute',
  config:                   alias('model.exoscaleConfig'),
  isCustomSecurityGroup:    equal('whichSecurityGroup', 'custom'),

  willDestroyElement() {
    set(this, 'errors', null);
    set(this, 'step', 1);
  },

  actions: {
    /* Login step */
    exoscaleLogin() {
      set(this, 'errors', null);
      set(this, 'step', 2);

      set(this,
        'config.apiKey',
        (get(this, 'config.apiKey') || '').trim()
      );
      set(this,
        'config.apiSecretKey',
        (get(this, 'config.apiSecretKey') || '').trim()
      );

      this.apiRequest('listZones').then((res) => {
        let zones = [];
        let defaultZone = null;

        (res.listzonesresponse.zone || []).forEach((zone) => {
          let obj = {
            id:        zone.id,
            name:      zone.name,
            isDefault: zone.name === get(this, 'defaultZone')
          };

          zones.push(obj);
          if (zone.isDefault && !defaultZone) {
            defaultZone = obj;
          }
        });

        set(this, 'step', 3);
        set(this, 'allZones', zones);
        set(this, 'defaultZone', defaultZone);
        set(this,
          'selectedZone',
          get(this, 'config.zone') ||
              get(this, 'allZones.firstObject.id')
        );
      }, (err) => {
        let errors = get(this, 'errors') || [];

        errors.pushObject(
          this.apiErrorMessage(
            err,
            'listzonesresponse',
            'While requesting zones',
            'Authentication failure: please check the provided access credentials'
          )
        );
        set(this, 'errors', errors);
        set(this, 'step', 1);
      }
      );
    },

    /* Zone selection */
    selectZone() {
      set(this, 'errors', null);

      set(this, 'config.zone', get(this, 'selectedZone'));
      (get(this, 'allZones') || []).forEach((zone) => {
        if (zone.id === get(this, 'selectedZone')) {
          set(this, 'config.availabilityZone', zone.name);
        }
      });

      set(this, 'step', 4);
      this.allSecurityGroups = []
      this.apiRequest('listSecurityGroups').then((res) => {
        // Retrieve the list of security groups.
        (res.listsecuritygroupsresponse.securitygroup || []).forEach((group) => {
          let obj = {
            id:          group.id,
            name:        group.name,
            description: group.description,
            isDefault:   group.name === get(this, 'defaultSecurityGroup')
          };

          this.allSecurityGroups.push(obj);
        }
        );

        // Move to next step
        set(this, 'step', 5);
        set(this,
          'securityGroup',
          [get(this, 'config.securityGroup')]);
      }, (err) => {
        let errors = get(this, 'errors') || [];

        errors.pushObject(
          this.apiErrorMessage(
            err,
            'listsecuritygroupsresponse',
            'While requesting security groups',
            'Authentication failure: please check the provided access credentials'
          )
        );
        set(this, 'errors', errors);
        set(this, 'step', 3);
      }
      );
    },

    /* Security group selection */
    selectSecurityGroup() {
      set(this, 'errors', null);

      /* When selecting a custom security group, we don't have to do anything more */
      if (get(this, 'isCustomSecurityGroup')) {
        set(this,
          'config.securityGroup',
          [get(this, 'securityGroup')]
        );
        this.fetchInstanceSettings();

        return;
      }

      /* Otherwise, do we need to create the default security group? */
      set(this,
        'config.securityGroup',
        [get(this, 'defaultSecurityGroup')]
      );
      let group = get(this, 'defaultSecurityGroup');

      /* Check if default security group allready exist in all security group*/
      var i;

      for (i = 0; i < this.allSecurityGroups.length; i++) {
        if (this.allSecurityGroups[i].name === group) {
          set(this, 'config.securityGroup', [group]);
          this.fetchInstanceSettings();

          /* Already exists, we assume that it contains the appropriate rules */
          return;
        }
      }

      /* We need to create the security group */
      set(this, 'step', 6);
      this.apiRequest('createSecurityGroup', {
        name:        get(this, 'defaultSecurityGroup'),
        description: `${ get(this, 'settings.appName')  } default security group`
      }).then((res) => {
        RANCHER_INGRESS_RULES.push({
          startport:                          2379,
          endport:                            2380,
          'usersecuritygrouplist[0].account': res.createsecuritygroupresponse.securitygroup.account,
          'usersecuritygrouplist[0].group':   res.createsecuritygroupresponse.securitygroup.name,
          protocol:                           'TCP'
        });

        return eachSeries(
          RANCHER_INGRESS_RULES,
          (item, cb) => {
            item.securitygroupid =
                res.createsecuritygroupresponse.securitygroup.id;
            this.apiRequest('authorizeSecurityGroupIngress', item).then(() => {
              return cb();
            }, (err) => {
              return cb(err);
            }
            );
          }, (err) => {
            if (err) {
              let errors = get(this, 'errors') || [];

              errors.pushObject(
                this.apiErrorMessage(
                  err,
                  'authorizesecuritygroupingressresponse',
                  'While setting default security group',
                  'Unable to configure the default security group'
                )
              );
              set(this, 'errors', errors);
              set(this, 'step', 5);
            } else {
              this.fetchInstanceSettings();
            }
          }
        );
      }, (err) => {
        let errors = get(this, 'errors') || [];

        errors.pushObject(
          this.apiErrorMessage(
            err,
            'createsecuritygroupresponse',
            'While creating default security group',
            'Unable to create the default security group'
          )
        );
        set(this, 'errors', errors);
        set(this, 'step', 5);
      }
      );
    }
  },

  afterInit: on('init', function() {
    this._super();

    let cur = get(this, 'config.securityGroup');

    if (cur === RANCHER_GROUP) {
      this.setProperties({
        whichSecurityGroup:    'default',
        securityGroup:      null
      });
    } else {
      this.setProperties({
        whichSecurityGroup:    'custom',
        securityGroup:      [cur]
      });
    }
  }),

  bootstrap() {
    let config = get(this, 'globalStore').createRecord({
      type:            'exoscaleConfig',
      apiKey:          '',
      apiSecretKey:    '',
      diskSize:        50,
      image:           DEFAULT_TEMPLATE,
      instanceProfile: 'Medium',
      securityGroup:   RANCHER_GROUP
    });

    const model = get(this, 'model');

    set(model, 'exoscaleConfig', config);
  },

  fetchInstanceSettings() {
    set(this, 'step', 7);

    /* First, get a list of templates to get available disk sizes */
    this.apiRequest('listTemplates', {
      templatefilter: 'featured',
      zoneid:         get(this, 'config.zone')
    }).then((res) => {
      set(this,
        'allTemplates',
        res.listtemplatesresponse.template
          .filter((item) => item.name.startsWith('Linux'))
          .map((item) => item.name)
          .sort()
          .uniq()
      );

      /* Also get the instance types */
      return this.apiRequest('listServiceOfferings', { issystem: 'false' }).then((res) => {
        set(this,
          'allInstanceProfiles',
          res.listserviceofferingsresponse.serviceoffering
            .sort((a, b) => {
              if (a.memory < b.memory) {
                return -1;
              }
              if (b.memory < a.memory) {
                return 1;
              }

              return 0;
            })
            .map((item) => ({
              name:        item.name,
              displaytext: item.displaytext
            }))
        );
        set(this, 'step', 8);
      }, (err) => {
        let errors = get(this, 'errors') || [];

        errors.pushObject(
          this.apiErrorMessage(
            err,
            'listserviceofferingsresponse',
            'While getting list of instance types',
            'Unable to get list of instance types'
          )
        );
        set(this, 'errors', errors);
        set(this, 'step', 5);
      }
      );
    }, (err) => {
      let errors = get(this, 'errors') || [];

      errors.pushObject(
        this.apiErrorMessage(
          err,
          'listtemplatesresponse',
          'While getting list of available images',
          'Unable to get list of available images'
        )
      );
      set(this, 'errors', errors);
      set(this, 'step', 5);
    }
    );
  },

  apiErrorMessage(err, kind, prefix, def) {
    let answer = (err.xhr || {}).responseJSON || {};
    let text = (answer[kind] || {}).errortext;

    if (text) {
      return `${ prefix  }: ${  text }`;
    } else {
      return def;
    }
  },

  apiRequest(command, params) {
    let url = `${ get(this, 'app.proxyEndpoint')  }/${  this.exoscaleApi }`;

    params = params || {};
    params.command = command;
    params.apiKey = get(this, 'config.apiKey');
    params.response = 'json';

    return ajaxPromise(
      {
        url,
        method:   'POST',
        dataType: 'json',
        headers:  {
          Accept:                   'application/json',
          'X-API-Headers-Restrict': 'Content-Length'
        },
        beforeSend: (xhr, settings) => {
          // Append 'rancher:' to Content-Type
          xhr.setRequestHeader(
            'Content-Type',
            `rancher:${  settings.contentType }`
          );

          // Compute the signature
          let qs = settings.data
            .split('&')
            .map((q) => q.replace(/\+/g, '%20').replace(/\%5B/g, '[').replace(/\%5D/g, ']'))
            .map(Function.prototype.call, String.prototype.toLowerCase)
            .sort()
            .join('&');

          settings.data +=
            `&signature=${
              encodeURIComponent(
                AWS.util.crypto.hmac(
                  get(this, 'config.apiSecretKey'),
                  qs,
                  'base64',
                  'sha1'
                )
              ) }`;

          return true;
        },
        data: params
      },
      true
    );
  }
});
