import Service from '@ember/service';
import Semver from 'semver';
import { setProperties } from '@ember/object';
import { satisfies, coerceVersion } from 'shared/utils/parse-version';
import C from 'shared/utils/constants';
import { alias } from '@ember/object/computed';
import { inject as service } from '@ember/service';

export default Service.extend({
  intl:     service(),
  settings: service(),

  defaultK8sVersionRange: alias(`settings.${ C.SETTING.VERSION_SYSTEM_K8S_DEFAULT_RANGE }`),

  parseCloudProviderVersionChoices(versions, providerVersion, mode) {
    let {
      intl,
      defaultK8sVersionRange
    } = this;
    const maxVersionRange = defaultK8sVersionRange.split(' ').pop();

    return versions.map((version) => {
      if (satisfies(coerceVersion(version), maxVersionRange)) {
        const out = {
          label: version,
          value: version,
        };

        if (mode === 'edit') {
          if (Semver.lt(coerceVersion(version), coerceVersion(providerVersion))) {
            setProperties(out, {
              disabled: true,
              label:    `${ out.label } ${ intl.t('formVersions.downgrade') }`
            });
          }
        }

        return out;
      }
    });
  }
});
