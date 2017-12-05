import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    // @TODO-2.0
    let TRUE = true;
    if ( TRUE ) {
      return {};
    }

    return this.get('globalStore').find('localauthconfig', null, {forceReload: true}).then((collection) => {
      return collection.get('firstObject');
    });
  },
});
