import Ember from 'ember';
import Util from 'ui/utils/util';
import NewOrEdit from 'ui/mixins/new-or-edit';
import ManageLabels from 'ui/mixins/manage-labels';
import { addAction } from 'ui/utils/add-view-action';

export default Ember.Mixin.create(NewOrEdit, ManageLabels, {
  intl: Ember.inject.service(),
  settings: Ember.inject.service(),
  createDelayMs: 0,
  showEngineUrl: true,

  queryParams   : ['machineId'],
  machineId     : null,
  error         : null,

  count         : null,
  prefix        : null,
  multiTemplate : null,
  clonedModel   : null,

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

  afterInit: function() {
    this.set('error', null);
    this.set('editing', false);

    if (this.get('clonedModel')) {
      this.set('model', this.get('clonedModel'));
      this.set('prefix', this.get('primaryResource.name')||'');
    } else if (typeof this.get('bootstrap') === 'function') {
      this.bootstrap();
    }
  }.on('init'),

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
    if ( typeof parts.name !== 'undefined' || !parts.prefix )
    {
      this.set('primaryResource.name', parts.name || '');
    }
    else
    {
      let first = parts.prefix + Util.strPad(parts.start, parts.minLength, '0');
      this.set('primaryResource.name', first);
    }
  }.observes('nameParts'),

  willSave: function() {
    this.set('multiTemplate', this.get('primaryResource').clone());
    return this._super();
  },

  didSave: function() {
    if ( this.get('count') > 1 )
    {
      let parts = this.get('nameParts');
      let tpl = this.get('multiTemplate');
      let delay = this.get('createDelayMs');
      var promise = new Ember.RSVP.Promise(function(resolve,reject) {
        let machines = [];
        for ( let i = parts.start + 1 ; i <= parts.end ; i++ )
        {
          let machine = tpl.clone();
          machine.set('name', parts.prefix + Util.strPad(i, parts.minLength, '0'));
          machines.push(machine);
        }

        async.eachSeries(machines, function(machine, cb) {
          machine.save().then(() => {
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

  doneSaving: function() {
    let out = this._super();
    this.send('goBack');
    return out;
  },
  didInsertElement: function() {
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
