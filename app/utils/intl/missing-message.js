import Ember from 'ember';

const { Logger:logger } = Ember;

export default function missingMessage(key, locales) {
  locales = locales||['unknown'];
  logger.warn(`translation not found: locale='${locales.join(', ')}', key='${key}'.`);
  return `*%${key}%*`;
}

