import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  catalog:     Ember.inject.service(),
  project:     null,
  catalogs:    null,
  ary:         null,
  global:      null,
  actions:     {
    add() {
      this.get('ary').pushObject(Ember.Object.create({name: '', branch: C.CATALOG.DEFAULT_BRANCH, url: '', toAdd: true}));
      Ember.run.next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.$('INPUT.name').last()[0].focus();
      });
    },
    remove(obj) {
      Ember.set(obj, 'toRemove', true);
    },
    save(cb) {
      if (this.validate()) {
        this.set('errors', []);
        var newCatalogs = this.get('ary').filterBy('toAdd', true);
        var catalogsToRemove = this.get('ary').filterBy('toRemove', true);
        var all = [];

        newCatalogs.forEach((cat) => {
          all.push(this.addCatalogs(cat));
        });

        catalogsToRemove.forEach((cat) => {
          all.push(this.removeCatalogs(cat));
        });

        Ember.RSVP.all(all).then(() => {
          this.set('catalog.componentRequestingRefresh', true);
          this.set('saving', false);
          cb(true);
          Ember.run.later(() => {
            this.sendAction('cancel');
          }, 500);
        }).catch((err) => {
          this.set('errors',err);
          cb(false);
          this.set('saving', false);
        });
      } else {
        cb(false);
        this.set('saving', false);
      }
    }
  },
  validate: function() {
    var errors = [];
    var globals = ['all', 'community', 'library']; // these should be removed when these terms are removed from the envid field
    var newCatalogs = this.get('ary').filterBy('toAdd', true);

    if (newCatalogs.length) {
      newCatalogs.forEach((cat) => {
        if ( (cat.name||'').trim().length === 0 )
        {
          errors.push('A name is required');
        }
        if ( (cat.url||'').trim().length === 0 )
        {
          errors.push('A url is required');
        }
        if (globals.indexOf(cat.name.toLowerCase()) >= 0) {
          errors.push('Catalog name can not match a gloabl catalog name');
        }
      });
    }

    if ( errors.length )
    {
      this.set('errors',errors.uniq());
      return false;
    }
    else
    {
      this.set('errors', null);
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
  init() {
    this._super(...arguments);
    this.setProperties({
      ary: this.get('catalogs').filterBy('environmentId', this.get('project.id')),
      global: this.get('catalogs').filterBy('environmentId', 'global') // this should change to falsey check when josh updates the catalog to remove 'global' from the id
    });
  }
});
