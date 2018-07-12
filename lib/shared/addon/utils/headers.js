const VOLUMES = [
  {
    name:           'serviceName',
    sort:           ['instance.service.displayName:desc', 'instanceId:desc'],
    translationKey: 'volumesPage.mounts.table.instance',
  },
  {
    name:           'instanceName',
    sort:           ['instanceName:desc', 'instanceId:desc'],
    translationKey: 'volumesPage.mounts.table.instance',
  },
  {
    name:           'path',
    sort:           ['path'],
    translationKey: 'volumesPage.mounts.table.path',
  },
  {
    name:           'permission',
    sort:           ['permission'],
    translationKey: 'volumesPage.mounts.table.permission',
  },
];

export default { volumes: VOLUMES };
