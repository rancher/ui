import Controller from '@ember/controller';

export default Controller.extend({
  labelHeaders: [
    {
      name:           'key',
      sort:           ['key'],
      translationKey: 'labelsSection.key',
      width:          '350',
    },
    {
      name:           'value',
      sort:           ['value', 'key'],
      translationKey: 'labelsSection.value',
    },
  ],
});
