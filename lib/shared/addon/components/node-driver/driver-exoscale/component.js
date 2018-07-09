import { alias, equal } from '@ember/object/computed';
import { get, set } from '@ember/object';
import Component from '@ember/component';
import NodeDriver from 'shared/mixins/node-driver';
import { ajaxPromise } from 'ember-api-store/utils/ajax-promise';
import layout from './template';

let RANCHER_TEMPLATE      = 'Linux Ubuntu 14.04 LTS 64-bit';
let RANCHER_GROUP         = 'rancher-machine';
let RANCHER_INGRESS_RULES = [
  {
    startport: 22,
    endport:   22,
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

export default Component.extend(NodeDriver, {
  layout,
  driverName: 'exoscale',
  model:      null,
  step:       1,

  allDiskSizes:        null,
  allInstanceProfiles: null,

  allSecurityGroups:        null,
  selectedSecurityGroup:    null,
  defaultSecurityGroup:     null,
  defaultSecurityGroupName: RANCHER_GROUP,
  whichSecurityGroup:       'default',
  exoscaleApi:              'api.exoscale.ch/compute',

  config:                alias('model.exoscaleConfig'),
  isCustomSecurityGroup:    equal('whichSecurityGroup', 'custom'),
  init() {

    this._super();

    const cur = get(this, 'config.securityGroup');

    if (cur === RANCHER_GROUP) {

      this.setProperties({
        whichSecurityGroup:    'default',
        selectedSecurityGroup: null
      });

    } else {

      this.setProperties({
        whichSecurityGroup:    'custom',
        selectedSecurityGroup: cur
      });

    }

  },

  actions: {
    /* Login step */
    exoscaleLogin() {

      set(this, 'errors', null);
      set(this, 'step', 2);

      set(this, 'config.exoscaleApiKey', (get(this, 'config.exoscaleApiKey') || '').trim());
      set(this, 'config.exoscaleApiSecretKey', (get(this, 'config.exoscaleApiSecretKey') || '').trim());

      this.apiRequest('listSecurityGroups').then((res) => {

        let groups       = [];
        let defaultGroup = null;

        /* Retrieve the list of security groups. */
        (res.listsecuritygroupsresponse.securitygroup || [])
          .forEach((group) => {

            let obj = {
              id:          group.id,
              name:        group.name,
              description: group.description,
              isDefault:   group.name === get(this, 'defaultSecurityGroupName')
            };

            groups.push(obj);
            if (obj.isDefault && !defaultGroup) {

              defaultGroup = obj;

            }

          });

        /* Move to next step */
        set(this, 'step', 3);
        set(this, 'allSecurityGroups', groups);
        set(this, 'defaultSecurityGroup', defaultGroup);
        set(this, 'selectedSecurityGroup', get(this, 'config.securityGroup') || get(this, 'allSecurityGroups.firstObject.id'));

      }, (err) => {

        let errors = get(this, 'errors') || [];

        errors.pushObject(this.apiErrorMessage(err,
          'listsecuritygroupsresponse',
          'While requesting security groups',
          'Authentication failure: please check the provided access credentials'
        ));
        set(this, 'errors', errors);
        set(this, 'step', 1);

      });

    },

    /* Security group selection */
    selectSecurityGroup() {

      set(this, 'errors', null);

      /* When selecting a custom security group, we don't have to do anything more */
      if (get(this, 'isCustomSecurityGroup')) {

        set(this, 'config.securityGroup', get(this, 'selectedSecurityGroup'));
        this.fetchInstanceSettings();

        return;

      }

      /* Otherwise, do we need to create the default security group? */
      set(this, 'config.securityGroup', get(this, 'defaultSecurityGroupName'));
      let group = get(this, 'defaultSecurityGroup');

      if (group) {

        /* Already exists, we assume that it contains the appropriate rules */
        set(this, 'config.securityGroup', group.name);
        this.fetchInstanceSettings();

        return;

      }

      /* We need to create the security group */
      set(this, 'step', 4);
      this.apiRequest('createSecurityGroup', {
        name:        get(this, 'defaultSecurityGroupName'),
        description: `${ get(this, 'settings.appName')  } default security group`
      }).then((res) => {

        return async.eachSeries(RANCHER_INGRESS_RULES, (item, cb) => {

          item.securitygroupid = res.createsecuritygroupresponse.securitygroup.id;
          this.apiRequest('authorizeSecurityGroupIngress', item)
            .then(() => {

              return cb();

            }, (err) => {

              return cb(err);

            });

        }, (err) => {

          if (err) {

            let errors = get(this, 'errors') || [];

            errors.pushObject(this.apiErrorMessage(err,
              'authorizesecuritygroupingressresponse',
              'While setting default security group',
              'Unable to configure the default security group'
            ));
            set(this, 'errors', errors);
            set(this, 'step', 3);

          } else {

            this.fetchInstanceSettings();

          }

        });

      }, (err) => {

        let errors = get(this, 'errors') || [];

        errors.pushObject(this.apiErrorMessage(err,
          'createsecuritygroupresponse',
          'While creating default security group',
          'Unable to create the default security group'
        ));
        set(this, 'errors', errors);
        set(this, 'step', 3);

      });

    }
  },

  bootstrap() {

    const config = get(this, 'globalStore').createRecord({
      type:                 'exoscaleConfig',
      exoscaleApiKey:       '',
      exoscaleApiSecretKey: '',
      diskSize:             50,
      instanceProfile:      'small',
      securityGroup:        'rancher-machine'
    });

    const model = get(this, 'model');

    set(model, 'exoscaleConfig', config);

  },

  fetchInstanceSettings() {

    set(this, 'step', 5);

    /* First, get a list of templates to get available disk sizes */
    this.apiRequest('listTemplates', {
      templatefilter: 'featured',
      name:           RANCHER_TEMPLATE
    }).then((res) => {

      set(this, 'allDiskSizes',
        res.listtemplatesresponse.template
          .map((item) => Math.round(item.size / 1024 / 1024 / 1024))
          .sort((a, b) => (a - b))
          .uniq()
      );

      /* Also get the instance types */
      return this.apiRequest('listServiceOfferings', { issystem: 'false' }).then((res) => {

        set(this, 'allInstanceProfiles',
          res.listserviceofferingsresponse.serviceoffering.sort((a, b) => {

            if (a.memory < b.memory) {

              return -1;

            }
            if (b.memory < a.memory) {

              return 1;

            }

            return 0;

          }).map((item) => {

            return {
              name:        item.name,
              displaytext: item.displaytext
            }

          }));

        set(this, 'step', 6);

      })
        .catch((err) => {

          let errors = get(this, 'errors') || [];

          errors.pushObject(this.apiErrorMessage(err,
            'listserviceofferingsresponse',
            'While getting list of instance types',
            'Unable to get list of instance types'
          ));
          set(this, 'errors', errors);
          set(this, 'step', 3);

        });

    })
      .catch((err) => {

        let errors = get(this, 'errors') || [];

        errors.pushObject(this.apiErrorMessage(err,
          'listtemplatesresponse',
          'While getting list of available images',
          'Unable to get list of available images'
        ));
        set(this, 'errors', errors);
        set(this, 'step', 3);

      });

  },

  apiErrorMessage(err, kind, prefix, def) {

    let answer = (err.xhr || {}).responseJSON || {};
    let text   = (answer[kind] || {}).errortext;

    if (text) {

      return `${ prefix  }: ${  text }`;

    } else {

      return def;

    }

  },

  apiRequest(command, params) {

    let url         = `${ get(this, 'app.proxyEndpoint')  }/${  this.exoscaleApi }`;

    params          = params || {};
    params.command  = command;
    params.apiKey   = get(this, 'config.exoscaleApiKey');
    params.response = 'json';

    return ajaxPromise({
      url,
      method:   'POST',
      dataType: 'json',
      data:     params,
      headers:  {
        'Accept':                 'application/json',
        'X-API-Headers-Restrict': 'Content-Length'
      },
      beforeSend: (xhr, settings) => {

        // Append 'rancher:' to Content-Type
        xhr.setRequestHeader('Content-Type',
          `rancher:${  settings.contentType }`);

        // Compute the signature
        let qs = settings.data.split('&')
          .map((q) => q.replace(/\+/g, '%20'))
          .map(Function.prototype.call, String.prototype.toLowerCase)
          .sort()
          .join('&');

        settings.data += `&signature=${  encodeURIComponent(AWS.util.crypto.hmac(
          get(this, 'config.exoscaleApiSecretKey'), qs, 'base64', 'sha1')) }`;

        return true;

      },
    }, true);

  },
});
