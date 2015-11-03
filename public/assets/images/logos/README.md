This folder contians all the images that have the logo in them.  You can replace them by running rancher/server with:

```-v /path/to/your/logos:/usr/share/cattle/war/assets/images/logos```

This replaces the entire folder, so you must supply all the files or they will be missing.

| File                | Usage                                                     |
|:--------------------|:----------------------------------------------------------|
| dark.svg            | On the Login screen when access control is enabled        |
| graphic.svg         | The parachuting cow part of the image on the About screen |
| main.svg            | Top-left corner of the main header                        |
| provider-custom.svg | Custom "Add Host" provider                                |
| provider-local.svg  | Local "Access Control" provider                           |
| text.svg            | The text part of hte image on the About screen            |
