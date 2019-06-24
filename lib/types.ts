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

export type ActionName = 'resinhup11' | 'resinhup12' | 'balenahup';

export interface ActionConfig {
	// the minimum resinOS source version, that the upgrade can be done for, includes this version
	minSourceVersion: string;
	// the the major version of the resinOS target that the script applies to
	targetMajorVersion?: number;
	// the minimum resinOS target version to upgrade to, includes this version
	minTargetVersion: string;
	// first resinOS version within the major version, that the updater can no longer target (update only to strictly lower versions than this)
	maxTargetVersion?: string;
}

export interface ActionsConfig {
	actions: { [K in ActionName]: ActionConfig };
	deviceTypesDefaults: { [K in ActionName]?: Partial<ActionConfig> };
	deviceTypes: Partial<{
		[deviceTypeSlug: string]: { [K in ActionName]?: Partial<ActionConfig> };
	}>;
}
