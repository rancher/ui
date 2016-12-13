import Ember from 'ember';
import Util from 'ui/utils/util';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ManageLabels from 'ui/mixins/manage-labels';
import { addAction } from 'ui/utils/add-view-action';

export default Ember.Mixin.create(NewOrEdit, ManageLabels, {
  intl          : Ember.inject.service(),
  settings      : Ember.inject.service(),
  createDelayMs : 0,
  showEngineUrl : true,

  queryParams   : ['hostId'],
  hostId        : null,
  error         : null,

  count         : null,
  prefix        : null,
  multiTemplate : null,
  clonedModel   : null,
  useHost       : true,

  actions: {
    addLabel: addAction('addLabel', '.key'),
    cancel() {
      this.attrs.cancel();
    },
    goBack() {
      this.attrs.goBack();
    },
    setLabels(labels) {
      let out = {};
      labels.forEach((row) => {
        out[row.key] = row.value;
      });

      this.set('primaryResource.labels', out);
    }
  },

  init() {
    this._super(...arguments);

    this.set('error', null);
    this.set('editing', false);

    if (this.get('clonedModel')) {
      this.set('model', this.get('clonedModel'));
      this.set('prefix', '');
    } else if (typeof this.get('bootstrap') === 'function') {
      this.bootstrap();
    }
  },

  nameParts: function() {
    let input = this.get('prefix')||'';
    let count = this.get('count');
    let match = input.match(/^(.*?)([0-9]+)$/);

    if ( count <= 1 )
    {
      return {
        name: input,
      };
    }

    let prefix, minLength, start;
    if ( match && match.length )
    {
      prefix = match[1];
      minLength = (match[2]+'').length;
      start = parseInt(match[2],10);
    }
    else
    {
      prefix = input;
      minLength = 1;
      start = 1;
    }

    // app98 and count = 3 will go to 101, so the minLength should be 3
    let end = start + count - 1;
    minLength = Math.max(minLength, (end+'').length);

    return {
      prefix: prefix,
      minLength: minLength,
      start: start,
      end: end
    };
  }.property('prefix','count'),

  nameCountLabel: function() {
    let parts = this.get('nameParts');
    if ( typeof parts.name !== 'undefined' || !parts.prefix )
    {
      // qty=1 or no input yet, nothing to see here...
      return '';
    }

    let first = parts.prefix + Util.strPad(parts.start, parts.minLength, '0');
    let last = parts.prefix + Util.strPad(parts.end, parts.minLength, '0');
    return this.get('intl').tHtml('driver.multiHostNames',{first: first, last: last});
  }.property('nameParts','intl._locale'),

  nameDidChange: function() {
    let parts = this.get('nameParts');
    let nameField = 'hostname';
    if (this.get('primaryResource.type') === 'machine') {
      nameField = 'name';
    }
    if ( typeof parts.name !== 'undefined' || !parts.prefix )
    {
      this.set(`primaryResource.${nameField}`, parts.name || '');
    }
    else
    {
      let first = parts.prefix + Util.strPad(parts.start, parts.minLength, '0');
      this.set(`primaryResource.${nameField}`, first);
    }
  }.observes('nameParts'),

  willSave() {
    this.set('multiTemplate', this.get('primaryResource').clone());
    return this._super();
  },

  validate() {
    let errors = [];

    if ( !this.get('nameParts.prefix') && !this.get('nameParts.name') ) {
      errors.push('Name is required');
    }

    this.set('errors', errors);
    return errors.length === 0;
  },


  didSave() {
    if ( this.get('count') > 1 )
    {
      let parts = this.get('nameParts');
      let tpl = this.get('multiTemplate');
      let delay = this.get('createDelayMs');
      var promise = new Ember.RSVP.Promise(function(resolve,reject) {
        let hosts = [];
        for ( let i = parts.start + 1 ; i <= parts.end ; i++ )
        {
          let host = tpl.clone();
          host.set('hostname', parts.prefix + Util.strPad(i, parts.minLength, '0'));
          hosts.push(host);
        }

        async.eachSeries(hosts, function(host, cb) {
          host.save().then(() => {
            setTimeout(cb, delay);
          }).catch((err) => {
            cb(err);
          });
        }, function(err) {
          if ( err ) {
            reject(err);
          } else {
            resolve();
          }
        });
      });

      return promise;
    }
  },

  doneSaving() {
    let out = this._super();
    this.send('goBack');
    return out;
  },

  didInsertElement() {
    this._super();
    Ember.run.next(() => {
      try {
        let input = this.$('INPUT')[0];
        if ( input )
        {
          input.focus();
        }
      }
      catch(e) {
      }
    });
  },
});
