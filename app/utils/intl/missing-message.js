import Ember from 'ember';

const { Logger:logger } = Ember;

export default function missingMessage(key, locales) {
  logger.warn(`translation not found: locale='${locales.join(', ')}', key='${key}'.`);
  return `*%${key}%*`;
}

