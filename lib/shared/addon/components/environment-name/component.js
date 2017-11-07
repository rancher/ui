import Component from '@ember/component';
import layout from './template';

let notFound= {};

export default Component.extend({
  layout,
  environmentId: null,
  loading: true,
  env: null,
  onlyType: null,

  tagName: '',

  init() {
    this._super();

    const us = this.get('userStore');

    let id = this.get('environmentId');
    let onlyType = this.get('onlyType');

    this.setProperties({
      loading: true,
      env: null
    });

    let env = us.getById('project', id);
    if ( env || notFound[id] ) {
      this.setProperties({
        env: env,
        loading: false,
      });
      return;
    }

    if ( id ) {
      us.find('project', id).then((env) => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        if ( !onlyType || env.get('type').toLowerCase() === onlyType.toLowerCase() )
        {
          this.set('env', env);
        }
      }).catch(() => {
        notFound[id] = true;

        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.set('env', null);
      }).finally(() => {
        if ( this.isDestroyed || this.isDestroying ) {
          return;
        }

        this.set('loading', false);
      });
    } else {
      this.set('loading',false);
    }
  }
});
