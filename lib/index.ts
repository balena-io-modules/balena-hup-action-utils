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

import * as rSemver from 'resin-semver';
import { actionsConfig } from './config';
import { ActionName } from './types';
export * from './types';

// ensure `version` is not a `dev` variant
const isDevVariant = (version: string): boolean => {
	const parsed = rSemver.parse(version);
	if (parsed == null) {
		return false;
	}
	return parsed.build.concat(parsed.prerelease).indexOf('dev') >= 0;
};

//
// Return resinhup type based on device type, current and target balenaOS versions
// Currently available types are:
//  - resinhup11
//  - resinhup12
//  - resinhup22
//
// For a more detailed list of supported actions per device type check actions/config.json
//
// Throws error in any of these cases:
//  - Current or target versions are invalid
//  - Current or target versions do not refer to production releases
//  - Current and target versions imply a downgrade operation
//  - Action is not supported by device type
//
export const getHUPActionType = (
	deviceType: string,
	currentVersion: string,
	targetVersion: string,
) => {
	if (!rSemver.valid(currentVersion)) {
		throw new Error('Invalid current balenaOS version');
	}

	if (!rSemver.valid(targetVersion)) {
		throw new Error('Invalid target balenaOS version');
	}

	if (rSemver.prerelease(currentVersion) || rSemver.prerelease(targetVersion)) {
		throw new Error(
			'Updates cannot be performed on pre-release balenaOS versions',
		);
	}

	if (isDevVariant(currentVersion) || isDevVariant(targetVersion)) {
		throw new Error(
			'Updates cannot be performed on development balenaOS variants',
		);
	}

	if (rSemver.lt(targetVersion, currentVersion)) {
		throw new Error('OS downgrades are not allowed');
	}

	if (rSemver.compare(currentVersion, targetVersion) === 0) {
		throw new Error('Current OS version matches Target OS version');
	}

	const fromMajor = rSemver.major(currentVersion);
	const toMajor = rSemver.major(targetVersion);
	const actionName = `resinhup${fromMajor}${toMajor}` as ActionName;

	const deviceSpecific = actionsConfig.deviceTypes[deviceType];

	if (deviceSpecific == null || deviceSpecific[actionName] == null) {
		throw new Error(
			`This update request cannot be performed on '${deviceType}'`,
		);
	}

	const {
		minSourceVersion,
		targetMajorVersion,
		minTargetVersion,
		maxTargetVersion,
	} = {
		...actionsConfig.actions[actionName],
		...deviceSpecific[actionName],
	};

	if (rSemver.lt(currentVersion, minSourceVersion)) {
		throw new Error(`Current OS version must be >= ${minSourceVersion}`);
	}

	if (rSemver.major(targetVersion) !== targetMajorVersion) {
		throw new Error(
			`Target OS version must be of major version ${targetMajorVersion}`,
		);
	}

	if (rSemver.lt(targetVersion, minTargetVersion)) {
		throw new Error(`Target OS version must be >= ${minTargetVersion}`);
	}

	if (maxTargetVersion && rSemver.gte(targetVersion, maxTargetVersion!)) {
		throw new Error(`Target OS version must be < ${maxTargetVersion}`);
	}

	return actionName;
};

export const isSupportedOsUpdate = (
	deviceType: string,
	currentVersion: string,
	targetVersion: string,
) => {
	try {
		return !!getHUPActionType(deviceType, currentVersion, targetVersion);
	} catch (err) {
		return false;
	}
};
