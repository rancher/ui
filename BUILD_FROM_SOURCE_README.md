# Build Instructions

The base tag this release is branched from is `release-2.7.2`

###Create Environment Variables

```
export BUILD_DIR=<Ember build output directory>
export RELEASE=<rancher-ui release version>
```



###Build Tarball


Update dependencies and create node_modules
```
./scripts/update-dependencies
```
Run ember build command
```
./node_modules/.bin/ember build --environment=production --output-path=${BUILD_DIR}/${RELEASE}
```

Remove .DS_Store files
```
find ${BUILD_DIR} -name '.DS_Store' -exec rm {} \\;
```

Create a tarball of the version
```
tar -czf ${RELEASE}.tar.gz -C ${BUILD_DIR} ${RELEASE}
```
