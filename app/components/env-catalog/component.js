import Ember from 'ember';
import C from 'ui/utils/constants';
import Util from 'ui/utils/util';

export default Ember.Component.extend({
  catalog:     Ember.inject.service(),
  project:     null,
  catalogs:    null,
  ary:         null,
  global:      null,

  toRemove: null,
  old: null,

  kindChoices: [
    {translationKey: 'catalogSettings.more.kind.native', value: 'native'},
    {translationKey: 'catalogSettings.more.kind.helm', value: 'helm'},
  ],

  init() {
    this._super(...arguments);
    this.set('toRemove', []);
    let old = this.get('catalogs').filterBy('environmentId', this.get('project.id')).map((x) => {
      let y = x.clone();
      y.uiId = Util.randomStr();
      return y;
    });
    this.set('old', old);


    this.setProperties({
      ary: old.map((x) => x.clone()),
      global: this.get('catalogs').filterBy('environmentId', 'global').slice(), // this should change to falsey check when josh updates the catalog to remove 'global' from the id
    });
  },

  actions:     {
    add() {
      let obj = Ember.Object.create({
        name: '',
        branch: C.CATALOG.DEFAULT_BRANCH,
        url: '',
        kind: 'native',
        isNew: true,
      });

      this.get('ary').pushObject(obj);

      Ember.run.next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.$('INPUT.name').last()[0].focus();
      });
    },

    remove(obj) {
      this.get('ary').removeObject(obj);
      if ( !obj.get('isNew') ) {
        this.get('toRemove').addObject(obj);
      }
    },

    save(cb) {
      if (this.validate()) {
        this.set('errors', []);
        let remove = this.get('toRemove');
        let cur = this.get('ary');

        let changes = [];

        // Remove
        remove.forEach((cat) => {
          changes.push(this.removeCatalogs(cat));
        });

        // Add/update
        cur.forEach((cat) => {
          cat.set('name', (cat.get('name')||'').trim());
          cat.set('url', (cat.get('url')||'').trim());
          cat.set('branch', (cat.get('branch')||'').trim() || C.CATALOG.DEFAULT_BRANCH);

          if ( cat.uiId ) {
            // Update maybe
            let orig = this.get('old').findBy('uiId', cat.uiId);
            if ( orig ) {
              if ( JSON.stringify(orig) === JSON.stringify(cat) ) {
                // Do nothing, nothing changed
              } else {
                // Update
                changes.push(cat.save());
              }
            } else {
              // This shouldn't happen, but add anyway
              changes.push(this.addCatalogs(cat));
            }
          } else {
            // Add
            changes.push(this.addCatalogs(cat));
          }
        });

        Ember.RSVP.allSettled(changes).then((settled) => {
          let errors = settled.filterBy('state', 'rejected');
          if (errors.length) {
            let errOut = [];
            errors.forEach((err) => {
              errOut.push(JSON.parse(err.reason.message).message);
            });
            this.set('errors',errOut.uniq());
            cb(false);

          } else {
            return new Ember.RSVP.Promise((resolve) => { setTimeout(resolve, 1); }).then(() => {

              return this.get('catalog').refresh().finally(() => {

                Ember.run.later(() => {
                  // @TODO ugh...
                  window.l('route:catalog-tab').send('refresh');
                  this.sendAction('cancel');
                }, 500);

              });

            });
          }

        }).catch((err) => {
          this.set('errors',err);
          cb(false);
        });

      } else {

        cb(false);

      }
    }
  },

  validate() {
    var errors = [];
    var global = this.get('global');
    var ary    = this.get('ary');

    ary.forEach((cat) => {

      if ( trimAndCheck(cat.name) ) {
        errors.push('Name is required on each catalog');
      }

      if ( trimAndCheck(cat.url) ) {
        errors.push('URL is required on each catalog');
      }

      if ( trimAndCheck(cat.branch) ) {
        errors.push('A Branch is required on each catalog');
      }

      if ( global.filter((x) => (x.name||'').trim().toLowerCase() === cat.name.toLowerCase()).length > 1 ||
              ary.filter((x) => (x.name||'').trim().toLowerCase() === cat.name.toLowerCase()).length > 1) {
        errors.push('Each catalog must have a unique name');
      }
    });

    if ( errors.length ) {
      this.set('errors',errors.uniq());
      return false;
    } else {
      this.set('errors', null);
    }

    function trimAndCheck(str) {
      return (str||'').trim().length === 0 ? true : false;
    }

    return true;
  },

  addCatalogs(catalogs) {
    return this.get('store').request({
      url: `${this.get('app.catalogEndpoint')}/catalogs`,
      method: 'POST',
      headers: {
        [C.HEADER.PROJECT_ID]: this.get('project.id')
      },
      body: JSON.stringify(catalogs)
    });
  },

  removeCatalogs(catalogs) {
    return this.get('store').request({
      url: `${this.get('app.catalogEndpoint')}/catalogs/${catalogs.name}`,
      method: 'DELETE',
      headers: {
        [C.HEADER.PROJECT_ID]: this.get('project.id')
      },
      body: JSON.stringify(catalogs)
    });
  },
});
