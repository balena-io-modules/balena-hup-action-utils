/*
	Copyright 2017 Balena Ltd.

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.
	You may obtain a copy of the License at

		http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

import type { ActionsConfig } from './types';

export const actionsConfig: ActionsConfig = {
	actions: {
		resinhup11: {
			minSourceVersion: '1.8.0',
			targetMajorVersion: 1,
			minTargetVersion: '1.26.0',
		},
		resinhup12: {
			minSourceVersion: '1.8.0',
			targetMajorVersion: 2,
			minTargetVersion: '2.2.0+rev1',
			maxTargetVersion: '2.5.1+rev1',
		},
		balenahup: {
			minSourceVersion: '2.0.0+rev1',
			minTargetVersion: '2.2.0+rev1',
		},
		takeover: {
			// Takeover is a possible action returned by getHUPActionType
			// but it really is a special case of balenahup that will happen
			// when minTakeoverVersion is defined.
			// We use nonsense values here to prevent this being used as any
			// other action
			minSourceVersion: '99.99.99',
			minTargetVersion: '99.99.99',
		},
	},
	deviceTypesDefaults: {
		balenahup: {},
	},
	deviceTypes: {
		'raspberry-pi': {
			resinhup11: {},
			resinhup12: {},
		},
		'raspberry-pi2': {
			resinhup11: {},
			resinhup12: {},
		},
		raspberrypi3: {
			resinhup11: {},
			resinhup12: {},
		},
		'beaglebone-black': {
			resinhup11: {},
			resinhup12: {
				minSourceVersion: '1.30.1',
			},
		},
		'beaglebone-green': {
			resinhup11: {},
			resinhup12: {
				minSourceVersion: '1.30.1',
			},
		},
		'beaglebone-green-wifi': {
			resinhup11: {},
			resinhup12: {
				minSourceVersion: '1.30.1',
			},
		},
		'intel-edison': {
			balenahup: {
				minTargetVersion: '2.9.7+rev2',
			},
		},
		'intel-nuc': {
			resinhup11: {},
			resinhup12: {},
		},
		'jetson-tx2': {
			balenahup: {
				minSourceVersion: '2.7.4',
			},
		},
		'jetson-xavier': {
			balenahup: {
				minTakeoverVersion: '6.0.50',
			},
		},
		'jetson-xavier-nx-devkit': {
			balenahup: {
				minTakeoverVersion: '6.0.50+rev1',
			},
		},
		'jetson-xavier-nx-devkit-emmc': {
			balenahup: {
				minTakeoverVersion: '6.0.39',
			},
		},
		qemux86: {
			balenahup: {
				minSourceVersion: '2.9.3',
			},
		},
		'qemux86-64': {
			balenahup: {
				minSourceVersion: '2.9.3',
			},
		},
		skx2: {
			balenahup: {
				minSourceVersion: '2.7.4',
			},
		},
		ts4900: {
			balenahup: {
				minSourceVersion: '2.4.1',
			},
		},
	},
};
