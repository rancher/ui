import Resource from 'ember-api-store/models/resource';
import { get, computed } from '@ember/object';
import { inject as service } from '@ember/service';

const BASE = 'user-base';
const USER = 'user';
const ADMIN = 'admin';
const SPECIAL = [BASE, ADMIN, USER];

export default Resource.extend({
  isHidden: computed('id', function() {

    return SPECIAL.includes(get(this, 'id'));

  }),

  isBase: computed('id', function() {

    return get(this, 'id') === BASE;

  }),

  isUser: computed('id', function() {

    return get(this, 'id') === USER;

  }),

  isAdmin: computed('id', function() {

    return get(this, 'id') === ADMIN;

  }),

  isCustom: computed('isAdmin', 'isUser', 'isBase', function() {

    return !get(this, 'isAdmin') && !get(this, 'isBase') && !get(this, 'isUser');

  }),

  displayName: computed('id', 'name', 'intl.locale', function() {

    const intl = get(this, 'intl');
    const id = get(this, 'id');
    const key = `formGlobalRoles.role.${ id }.label`;

    if ( intl.exists(key) ){

      return intl.t(key);

    }

    const name = get(this, 'name');

    if ( name ) {

      return name;

    }

    return `(${ id })`;

  }),

  detail: computed('name', 'intl.locale', function() {

    const intl = get(this, 'intl');
    const id = get(this, 'id');
    const key = `formGlobalRoles.role.${ id }.detail`;

    if ( intl.exists(key) ){

      return intl.t(key);

    }

    return '';

  }),

  intl: service(),

  canRemove: false,
});
