import Ember from 'ember';
import C from 'ui/utils/constants';

export default Ember.Component.extend({
  catalog: Ember.inject.service(),
  project: null,
  catalogs: null,
  ary: null,
  actions: {
    add() {
      this.get('ary').pushObject(Ember.Object.create({name: '', branch: C.CATALOG.DEFAULT_BRANCH, url: ''}));
      Ember.run.next(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.$('INPUT.name').last()[0].focus();
      });
    },
    remove(obj) {
      this.get('ary').removeObject(obj);
      this.get('aryToRemove').pushObject(obj);
    },
    save() {
      var newCatalogs = this.get('ary');
      var catalogsToRemove = this.get('aryToRemove');

      this.addCatalogs(newCatalogs).then((response) => {
        debugger;
        this.removeCatalogs(catalogsToRemove).then((removed) => {
          this.set('saving', false);
          debugger;
        }).catch((err) => {
          debugger;
        });
      }).catch((err) => {
        this.set('saving', false);
        debugger;
      })

    }
  },
  addCatalogs(catalogs) {
    return this.get('store').request({
      url: `${this.get('app.catalogEndpoint')}/catalogs`,
      method: 'POST',
      body: JSON.stringify(catalogs)
    });
  },
  removeCatalogs(catalogs) {
    return this.get('store').request({
      url: `${this.get('app.catalogEndpoint')}/catalogs`,
      method: 'DELETE',
      body: JSON.stringify(catalogs)
    });
  },
  init() {
    this._super(...arguments);
    this.set('ary', this.get('catalogs').filterBy('environmentId', this.get('project.id')));
  }
});
