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

import * as bSemver from 'balena-semver';
import includes = require('lodash/includes');
import { actionsConfig as defaultActionsConfig } from './config';
import { ActionName, ActionsConfig } from './types';
export { actionsConfig } from './config';
export * from './types';

// ensure `version` is not a `dev` variant
const isDevVariant = (version: string): boolean => {
	const parsed = bSemver.parse(version);
	if (parsed == null) {
		return false;
	}
	return includes(parsed.build.concat(parsed.prerelease), 'dev');
};

export class HUPActionHelper {
	constructor(private actionsConfig: ActionsConfig = defaultActionsConfig) {}

	/**
	 * @summary Returns the resinhup type based on device type, current and target balenaOS versions
	 * @name getHUPActionType
	 * @public
	 * @function
	 * @memberof HUPActionHelper
	 *
	 * @description Returns the resinhup type based on device type, current and target balenaOS versions
	 *
	 *  Currently available types are:
	 *   - resinhup11
	 *   - resinhup12
	 *   - resinhup22
	 *
	 *  For a more detailed list of supported actions per device type check config.ts
	 *
	 *  Throws error in any of these cases:
	 *   - Current or target versions are invalid
	 *   - Current or target versions do not refer to production releases
	 *   - Current and target versions imply a downgrade operation
	 *   - Action is not supported by device type
	 *
	 * @param {String} deviceType - device type slug
	 * @param {String} currentVersion - the current semver balenaOS version on the device
	 * @param {String} targetVersion - the target semver balenaOS version
	 *
	 * @returns {String}
	 *
	 * @example
	 * hupActionHelper.getHUPActionType('raspberrypi3', '2.0.0+rev1.prod', '2.2.0+rev1.prod');
	 */
	public getHUPActionType(
		deviceType: string,
		currentVersion: string,
		targetVersion: string,
	) {
		if (!bSemver.valid(currentVersion)) {
			throw new Error('Invalid current balenaOS version');
		}

		if (!bSemver.valid(targetVersion)) {
			throw new Error('Invalid target balenaOS version');
		}

		if (
			bSemver.prerelease(currentVersion) ||
			bSemver.prerelease(targetVersion)
		) {
			throw new Error(
				'Updates cannot be performed on pre-release balenaOS versions',
			);
		}

		if (isDevVariant(currentVersion) || isDevVariant(targetVersion)) {
			throw new Error(
				'Updates cannot be performed on development balenaOS variants',
			);
		}

		if (bSemver.lt(targetVersion, currentVersion)) {
			throw new Error('OS downgrades are not allowed');
		}

		if (bSemver.compare(currentVersion, targetVersion) === 0) {
			throw new Error('Current OS version matches Target OS version');
		}

		const fromMajor = bSemver.major(currentVersion);
		const toMajor = bSemver.major(targetVersion);
		const actionName = `resinhup${fromMajor}${toMajor}` as ActionName;

		const { actionsConfig } = this;
		const defaultActions = actionsConfig.deviceTypesDefaults;
		const deviceActions = actionsConfig.deviceTypes[deviceType] || {};

		if (
			defaultActions[actionName] == null &&
			deviceActions[actionName] == null
		) {
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
			...defaultActions[actionName],
			...deviceActions[actionName],
		};

		if (bSemver.lt(currentVersion, minSourceVersion)) {
			throw new Error(`Current OS version must be >= ${minSourceVersion}`);
		}

		if (bSemver.major(targetVersion) !== targetMajorVersion) {
			throw new Error(
				`Target OS version must be of major version ${targetMajorVersion}`,
			);
		}

		if (bSemver.lt(targetVersion, minTargetVersion)) {
			throw new Error(`Target OS version must be >= ${minTargetVersion}`);
		}

		if (maxTargetVersion && bSemver.gte(targetVersion, maxTargetVersion!)) {
			throw new Error(`Target OS version must be < ${maxTargetVersion}`);
		}

		return actionName;
	}

	/**
	 * @summary Returns whether the provided device type supports OS updates between the current and target balenaOS versions
	 * @name isSupportedOsUpdate
	 * @public
	 * @function
	 * @memberof HUPActionHelper
	 *
	 * @param {String} deviceType - device type slug
	 * @param {String} currentVersion - the current semver balenaOS version on the device
	 * @param {String} targetVersion - the target semver balenaOS version
	 *
	 * @returns {Boolean}
	 *
	 * @example
	 * hupActionHelper.isSupportedOsUpdate('raspberrypi3', '2.0.0+rev1.prod', '2.2.0+rev1.prod');
	 */
	public isSupportedOsUpdate(
		deviceType: string,
		currentVersion: string,
		targetVersion: string,
	) {
		try {
			return !!this.getHUPActionType(deviceType, currentVersion, targetVersion);
		} catch (err) {
			return false;
		}
	}
}
