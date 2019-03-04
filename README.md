balena-hup-action-utils
-----------------------

[![npm version](https://badge.fury.io/js/balena-hup-action-utils.svg)](http://badge.fury.io/js/balena-hup-action-utils)
[![dependencies](https://david-dm.org/balena-io-modules/balena-hup-action-utils.png)](https://david-dm.org/balena-io-modules/balena-hup-action-utils.png)
[![Build Status](https://travis-ci.org/balena-io-modules/balena-hup-action-utils.svg?branch=master)](https://travis-ci.org/balena-io-modules/balena-hup-action-utils)

Balena hostOS update validations &amp; utilities

Role
----

The intention of this module is to provide some low level common definitions and utilities for host OS updates.

**THIS MODULE IS LOW LEVEL AND IS NOT MEANT TO BE USED BY END USERS DIRECTLY**.

Unless you know what you're doing, use the [balena SDK](https://github.com/balena-io/balena-sdk) instead.

Installation
------------

Install `balena-hup-action-utils` by running:

```sh
$ npm install --save balena-hup-action-utils
```

Documentation
-------------

The module returns a class that you use to get an instance of the hup action helper.

**Example**
```js
import { HUPActionHelper } from 'balena-hup-action-utils';
const hupActionHelper = new HUPActionHelper();
hupActionHelper.getHUPActionType('raspberrypi3', '2.0.0+rev1.prod', '2.2.0+rev1.prod');
hupActionHelper.isSupportedOsUpdate('raspberrypi3', '2.0.0+rev1.prod', '2.2.0+rev1.prod');
```

Support
-------

If you're having any problem, please [raise an issue](https://github.com/balena-io-modules/balena-hup-action-utils/issues/new) on GitHub and the balena team will be happy to help.

Tests
-----

Run the test suite by doing:

```sh
$ npm test
```

Contribute
----------

- Issue Tracker: [github.com/balena-io-modules/balena-hup-action-utils/issues](https://github.com/balena-io-modules/balena-hup-action-utils/issues)
- Source Code: [github.com/balena-io-modules/balena-hup-action-utils](https://github.com/balena-io-modules/balena-hup-action-utils)

Before submitting a PR, please make sure that you include tests, and that [tslint](https://palantir.github.io/tslint/) runs without any warning:

```sh
$ npm run lint
```

License
-------

The project is licensed under the Apache 2.0 license.
