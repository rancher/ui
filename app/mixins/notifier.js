import Mixin from '@ember/object/mixin';
import { get, computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Mixin.create({
  getNotifierById(id) {
    if (!id) {
      return null;
    }
    const notifiers = get(this, 'notifiers');

    return notifiers.filterBy('id', id).get('firstObject');
  },

  recipientsTip: computed('notifiers.@each.{id,displayName}', 'alertGroup.recipients.@each.{length,notifierType,recipient,notifierId}', function() {
    const recipients = get(this, 'alertGroup.recipients') || [];
    const out = recipients.map((recipient) => {
      const notifierId = get(recipient, 'notifierId');
      const notifier = this.getNotifierById(notifierId);

      if (notifier) {
        const name = notifier.get('displayNameAndType');

        return `<div class="p-5 pt-0">${ name }</div>`;
      }

      return null;
    }).filter((str) => !!str).join('');

    return htmlSafe(out);
  }),
});
