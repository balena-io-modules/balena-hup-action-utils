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
import { TypedError } from 'typed-error';
import { actionsConfig as defaultActionsConfig } from './config';
import type { ActionName, ActionsConfig } from './types';
export { actionsConfig } from './config';
export * from './types';

type SemVer = NonNullable<ReturnType<typeof bSemver.parse>>;

const getVariant = (semver: SemVer) => {
	const semverExtraParts = [...semver.build, ...semver.prerelease];
	return ['dev', 'prod'].find((variant) => semverExtraParts.includes(variant));
};

export class HUPActionError extends TypedError {}

export class HUPActionHelper {
	public constructor(
		private actionsConfig: ActionsConfig = defaultActionsConfig,
	) {}

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
	 *   - balenahup
	 *   - takeover
	 *
	 *  For a more detailed list of supported actions per device type check config.ts
	 *
	 *  Throws error in any of these cases:
	 *   - Current or target versions are invalid
	 *   - Current or target versions do not match in dev/prod type
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
	): ActionName {
		const currentVersionParsed = bSemver.parse(currentVersion);
		if (currentVersionParsed == null) {
			throw new HUPActionError('Invalid current balenaOS version');
		}

		const targetVersionParsed = bSemver.parse(targetVersion);
		if (targetVersionParsed == null) {
			throw new HUPActionError('Invalid target balenaOS version');
		}

		const currentVariant = getVariant(currentVersionParsed);
		const targetVariant = getVariant(targetVersionParsed);
		if (
			targetVariant != null &&
			// Prefer checking only for dev
			(currentVariant === 'dev') !== (targetVariant === 'dev')
		) {
			throw new HUPActionError(
				'Updates cannot be performed between development and production balenaOS variants',
			);
		}

		if (bSemver.lt(targetVersion, currentVersion)) {
			throw new HUPActionError('OS downgrades are not allowed');
		}

		if (bSemver.compare(currentVersion, targetVersion) === 0) {
			throw new HUPActionError('Current OS version matches Target OS version');
		}

		const fromMajor = currentVersionParsed.major;
		const toMajor = targetVersionParsed.major;
		let actionName: ActionName;
		if (fromMajor === 1) {
			switch (toMajor) {
				case 1:
					actionName = 'resinhup11';
					break;
				case 2:
					actionName = 'resinhup12';
					break;
				default:
					throw new HUPActionError(
						`This update request cannot be performed from ${currentVersion} to ${targetVersion}`,
					);
			}
		} else {
			// actionName may change below to 'takeover'
			actionName = 'balenahup';
		}

		const { actionsConfig } = this;
		const defaultActions = actionsConfig.deviceTypesDefaults;
		const deviceActions = actionsConfig.deviceTypes[deviceType] ?? {};

		if (
			defaultActions[actionName] == null &&
			deviceActions[actionName] == null
		) {
			throw new HUPActionError(
				`This update request cannot be performed on '${deviceType}'`,
			);
		}

		const {
			minSourceVersion,
			targetMajorVersion,
			minTargetVersion,
			minTakeoverVersion,
			maxTargetVersion,
		} = {
			...actionsConfig.actions[actionName],
			...defaultActions[actionName],
			...deviceActions[actionName],
		};

		if (bSemver.lt(currentVersion, minSourceVersion)) {
			throw new HUPActionError(
				`Current OS version must be >= ${minSourceVersion}`,
			);
		}

		// If there's a major version constraint for the given action, take it into account
		if (
			targetMajorVersion &&
			bSemver.major(targetVersion) !== targetMajorVersion
		) {
			throw new HUPActionError(
				`Target OS version must be of major version ${targetMajorVersion}`,
			);
		}

		if (bSemver.lt(targetVersion, minTargetVersion)) {
			throw new HUPActionError(
				`Target OS version must be >= ${minTargetVersion}`,
			);
		}

		if (maxTargetVersion && bSemver.gte(targetVersion, maxTargetVersion)) {
			throw new HUPActionError(
				`Target OS version must be < ${maxTargetVersion}`,
			);
		}

		if (actionName === 'balenahup' && minTakeoverVersion != null) {
			// OS variant is not relevant and compares less than plain version,
			// which may erroneously trigger takeover again.
			const noVariantVersion = currentVersion.replace(/\.dev$|\.prod$/, '');
			if (
				bSemver.lt(noVariantVersion, minTakeoverVersion) &&
				bSemver.gte(targetVersion, minTakeoverVersion)
			) {
				return 'takeover';
			}
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
			if (err instanceof HUPActionError) {
				return false;
			}
			throw err;
		}
	}
}
