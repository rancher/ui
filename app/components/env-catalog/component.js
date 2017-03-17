import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  catalog:     Ember.inject.service(),
  project:     null,
  catalogs:    null,
  ary:         null,
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
        this.set('saving', false);
        cb(true);
        Ember.run.later(() => {
          this.sendAction('cancel');
        }, 500);
      }).catch((err) => {
        this.set('errors',err);
        cb(true);
        this.set('saving', false);
      });
    }
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
    });
  }
});
