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

import { ActionsConfig } from './types';

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
		resinhup22: {
			minSourceVersion: '2.0.0+rev1',
			targetMajorVersion: 2,
			minTargetVersion: '2.2.0+rev1',
		},
	},
	deviceTypes: {
		'raspberry-pi': {
			resinhup11: {},
			resinhup12: {},
			resinhup22: {},
		},
		'raspberry-pi2': {
			resinhup11: {},
			resinhup12: {},
			resinhup22: {},
		},
		raspberrypi3: {
			resinhup11: {},
			resinhup12: {},
			resinhup22: {},
		},
		artik530: {
			resinhup22: {},
		},
		artik533s: {
			resinhup22: {},
		},
		artik710: {
			resinhup22: {},
		},
		'asus-tinker-board': {
			resinhup22: {},
		},
		'asus-tinker-board-s': {
			resinhup22: {},
		},
		'bananapi-m1-plus': {
			resinhup22: {},
		},
		'beaglebone-black': {
			resinhup11: {},
			resinhup12: {
				minSourceVersion: '1.30.1',
			},
			resinhup22: {},
		},
		'beaglebone-green': {
			resinhup11: {},
			resinhup12: {
				minSourceVersion: '1.30.1',
			},
			resinhup22: {},
		},
		'beaglebone-green-wifi': {
			resinhup11: {},
			resinhup12: {
				minSourceVersion: '1.30.1',
			},
			resinhup22: {},
		},
		'beaglebone-pocket': {
			resinhup22: {},
		},
		fincm3: {
			resinhup22: {},
		},
		hummingboard: {
			resinhup22: {},
		},
		'imx6ul-var-dart': {
			resinhup22: {},
		},
		'intel-edison': {
			resinhup22: {
				minTargetVersion: '2.9.7+rev2',
			},
		},
		'intel-nuc': {
			resinhup11: {},
			resinhup12: {},
			resinhup22: {},
		},
		iot2000: {
			resinhup22: {},
		},
		'jetson-tx1': {
			resinhup22: {},
		},
		'jetson-tx2': {
			resinhup22: {
				minSourceVersion: '2.7.4',
			},
		},
		'odroid-c1': {
			resinhup22: {},
		},
		'odroid-xu4': {
			resinhup22: {},
		},
		'orangepi-plus2': {
			resinhup22: {},
		},
		'orbitty-tx2': {
			resinhup22: {},
		},
		qemux86: {
			resinhup22: {
				minSourceVersion: '2.9.3',
			},
		},
		'qemux86-64': {
			resinhup22: {
				minSourceVersion: '2.9.3',
			},
		},
		'revpi-core-3': {
			resinhup22: {},
		},
		skx2: {
			resinhup22: {
				minSourceVersion: '2.7.4',
			},
		},
		ts4900: {
			resinhup22: {
				minSourceVersion: '2.4.1',
			},
		},
		'up-board': {
			resinhup22: {},
		},
	},
};
