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

  parseCloudProviderVersionChoices(versions, providerVersion, mode, maxVersionRange = null, includePrerelease = false, experimentalRange = null, minVersionRange = null) {
    let {
      intl,
      defaultK8sVersionRange
    } = this;

    maxVersionRange = maxVersionRange ? maxVersionRange : defaultK8sVersionRange.split(' ').pop();
    minVersionRange = minVersionRange ? minVersionRange : defaultK8sVersionRange.split(' ').pop();

    return versions.map((version) => {
      // Only show versions between the max and min allowed versions, except if the cluster
      // is already at a version below the minimum. In that case, the existing version still
      // needs to be included as the default value when editing the cluster.
      if (satisfies(coerceVersion(version), maxVersionRange, { includePrerelease }) && (version === providerVersion || satisfies(coerceVersion(version), minVersionRange))) {
        const experimental = experimentalRange && satisfies(coerceVersion(version), experimentalRange) ? intl.t('generic.experimental')  : '';
        const out = {
          label: `${ version  } ${ experimental }`,
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
    }).filter((version) => version);
  },
  parseCloudProviderVersionChoicesV2(versions, providerVersion, mode, maxVersionRange = null, includePrerelease = false, minVersionRange = null) {
    let {
      intl,
      defaultK8sVersionRange
    } = this;

    maxVersionRange = maxVersionRange ? maxVersionRange : defaultK8sVersionRange.split(' ').pop();
    minVersionRange = minVersionRange ? minVersionRange : defaultK8sVersionRange.split(' ').pop();

    return versions.map((version) => {
      // Only show versions between the max and min allowed versions, except if the cluster
      // is already at a version below the minimum. In that case, the existing version still
      // needs to be included as the default value when editing the cluster.
      if (satisfies(version, maxVersionRange) && (version === providerVersion || satisfies(version, minVersionRange))) {
        const out = {
          label: version,
          value: version,
        };

        if (mode === 'edit') {
          if (Semver.lt(version, providerVersion, { includePrerelease })) {
            setProperties(out, {
              disabled: true,
              label:    `${ out.label } ${ intl.t('formVersions.downgrade') }`
            });
          }
        }

        return out;
      }
    }).filter((version) => version);
  }
});
