import { expect } from 'chai';
import { HUPActionHelper } from '../lib/index';

const SPECIAL_BEAGLEBONE_DEVICES = [
	'beaglebone-black',
	'beaglebone-green',
	'beaglebone-green-wifi',
];

describe('BalenaHupActionUtils', () => {
	let hupActionHelper: HUPActionHelper;

	before(() => {
		hupActionHelper = new HUPActionHelper();
	});

	describe('.getHUPActionType()', () => {
		it('Should not allow non-semver versions', () => {
			expect(() =>
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.9.6.7',
					'2.29.2+rev1.prod',
				),
			).to.throw('Invalid current balenaOS version');
			expect(() =>
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.9.6+rev2.prod',
					'2.29.2.3',
				),
			).to.throw('Invalid target balenaOS version');
		});

		it('Should not allow upgrades different .dev/.prod variants', () => {
			expect(() =>
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.9.6+rev2.dev',
					'2.29.2+rev1.prod',
				),
			).to.throw(
				'Updates cannot be performed between development and production balenaOS variants',
			);
			expect(() =>
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.9.6+rev2.prod',
					'2.29.2+rev1.dev',
				),
			).to.throw(
				'Updates cannot be performed between development and production balenaOS variants',
			);
		});

		it('Should allow .dev version updates', () => {
			expect(
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.9.6+rev2.dev',
					'2.29.2+rev1.dev',
				),
			).to.equal('balenahup');
		});

		it('Should allow upgrades from .prod versions to unified', () => {
			expect(
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.29.2+rev1.prod',
					'2.88.4',
				),
			).to.equal('balenahup');
		});

		it('Should allow upgrades from .dev versions to unified', () => {
			expect(
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.29.2+rev1.dev',
					'2.88.4',
				),
			).to.equal('balenahup');
		});

		it('Should allow upgrades between unified OS versions', () => {
			expect(
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.88.4',
					'2.88.4+rev1',
				),
			).to.equal('balenahup');
			expect(
				hupActionHelper.getHUPActionType('raspberry-pi', '2.88.4', '2.88.5'),
			).to.equal('balenahup');
		});

		it('Should allow upgrades from a finalized to a pre-release version', () => {
			expect(
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.9.6+rev2.prod',
					'2.29.2-1234+rev1',
				),
			).to.equal('balenahup');
		});

		it('Should allow upgrades from a pre-release to a finalized version', () => {
			expect(
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.9.6-1234+rev1',
					'2.29.2+rev1.prod',
				),
			).to.equal('balenahup');
		});

		it('Should allow upgrades from a pre-release to a newer pre-release version', () => {
			expect(
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.29.2-1234+rev1',
					'2.29.2-1234+rev2',
				),
			).to.equal('balenahup');
			expect(
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.29.2-1234+rev1',
					'2.29.3-1234+rev1',
				),
			).to.equal('balenahup');
		});

		it('Should not allow upgrades from a finalized to a pre-release version of the same base semver', () => {
			expect(() =>
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.29.2+rev1',
					'2.29.2-1234+rev2',
				),
			).to.throw('OS downgrades are not allowed');
		});

		it('Should not allow downgrades', () => {
			expect(() =>
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.29.2+rev1.prod',
					'2.9.6+rev2.prod',
				),
			).to.throw('OS downgrades are not allowed');
		});

		it('Should not allow downgrades between pre-release versions', () => {
			expect(() =>
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.29.2-1234+rev1.prod',
					'2.9.6-1234+rev2.prod',
				),
			).to.throw('OS downgrades are not allowed');
			expect(() =>
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.29.2-1234+rev2.prod',
					'2.29.2-1234+rev1.prod',
				),
			).to.throw('OS downgrades are not allowed');
		});

		it('Should error when the versions are the same', () => {
			expect(() =>
				hupActionHelper.getHUPActionType(
					'raspberry-pi',
					'2.9.6+rev2.prod',
					'2.9.6+rev2.prod',
				),
			).to.throw('Current OS version matches Target OS version');
		});

		it('Should error when the device type does not support hup at all', () => {
			expect(() =>
				hupActionHelper.getHUPActionType(
					'non-hup-able-device-type',
					'1.8.0',
					'1.26.0',
				),
			).to.throw(
				`This update request cannot be performed on 'non-hup-able-device-type'`,
			);

			expect(() =>
				hupActionHelper.getHUPActionType(
					'non-hup-able-device-type',
					'1.30.1',
					'2.2.0+rev1',
				),
			).to.throw(
				`This update request cannot be performed on 'non-hup-able-device-type'`,
			);

			// On version 2.x and above all device types must be supported
		});

		describe('v1 -> v1', () => {
			it('Should error when hup is not supported', () => {
				['artik530', 'beaglebone-pocket'].forEach((deviceType) => {
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.7.0', '1.26.0'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '1.25.0'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);
				});
			});

			it('Should error when hup between the provided versions is not supported', () => {
				['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.7.0', '1.26.0'),
					).to.throw('Current OS version must be >= 1.8.0');
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '1.25.0'),
					).to.throw('Target OS version must be >= 1.26.0');
				});
			});

			it('Should return resinhup11 when device specific v1 -> v1 hup is supported', () => {
				['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
					expect(
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '1.26.0'),
					).to.equal('resinhup11');
					expect(
						hupActionHelper.getHUPActionType(deviceType, '1.9.0', '1.27.0'),
					).to.equal('resinhup11');
					expect(
						hupActionHelper.getHUPActionType(deviceType, '1.26.0', '1.27.0'),
					).to.equal('resinhup11');
				});
			});
		});

		describe('v1 -> v2', () => {
			it('Should error when hup is not supported', () => {
				['artik530'].forEach((deviceType) => {
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.7.0', '2.3.0+rev1'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '2.1.0+rev1'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '2.2.0+rev0'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '2.5.0+rev1'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '2.5.1+rev0'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);

					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '2.5.1+rev1'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);
					expect(() =>
						hupActionHelper.getHUPActionType(
							deviceType,
							'1.30.1',
							'2.5.1+rev1',
						),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);
				});
			});

			it('Should error when hup between the provided versions is not supported', () => {
				['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.7.0', '2.3.0+rev1'),
					).to.throw('Current OS version must be >= 1.8.0');
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '2.1.0+rev1'),
					).to.throw('Target OS version must be >= 2.2.0+rev1');
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '2.2.0+rev0'),
					).to.throw('Target OS version must be >= 2.2.0+rev1');
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '2.5.1+rev1'),
					).to.throw('Target OS version must be < 2.5.1+rev1');
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '2.5.1+rev2'),
					).to.throw('Target OS version must be < 2.5.1+rev1');
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '2.5.2+rev1'),
					).to.throw('Target OS version must be < 2.5.1+rev1');
				});
			});

			it('Should error when hup between the provided versions is not supported for special device types', () => {
				SPECIAL_BEAGLEBONE_DEVICES.forEach((deviceType) => {
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.7.0', '2.3.0+rev1'),
					).to.throw('Current OS version must be >= 1.30.1');
					expect(() =>
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '2.3.0+rev1'),
					).to.throw('Current OS version must be >= 1.30.1');
					expect(() =>
						hupActionHelper.getHUPActionType(
							deviceType,
							'1.30.0',
							'2.3.0+rev1',
						),
					).to.throw('Current OS version must be >= 1.30.1');
					expect(() =>
						hupActionHelper.getHUPActionType(
							deviceType,
							'1.30.1',
							'2.1.0+rev1',
						),
					).to.throw('Target OS version must be >= 2.2.0+rev1');
					expect(() =>
						hupActionHelper.getHUPActionType(
							deviceType,
							'1.30.1',
							'2.2.0+rev0',
						),
					).to.throw('Target OS version must be >= 2.2.0+rev1');
					expect(() =>
						hupActionHelper.getHUPActionType(
							deviceType,
							'1.30.1',
							'2.5.1+rev1',
						),
					).to.throw('Target OS version must be < 2.5.1+rev1');
					expect(() =>
						hupActionHelper.getHUPActionType(
							deviceType,
							'1.30.1',
							'2.5.1+rev2',
						),
					).to.throw('Target OS version must be < 2.5.1+rev1');
					expect(() =>
						hupActionHelper.getHUPActionType(
							deviceType,
							'1.30.1',
							'2.5.2+rev1',
						),
					).to.throw('Target OS version must be < 2.5.1+rev1');
				});
			});

			it('Should return resinhup12 for supported hup versions', () => {
				['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
					expect(
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '2.2.0+rev1'),
					).to.equal('resinhup12');
					expect(
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '2.3.0+rev1'),
					).to.equal('resinhup12');
					expect(
						hupActionHelper.getHUPActionType(deviceType, '1.8.0', '2.5.0+rev1'),
					).to.equal('resinhup12');
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'1.26.0',
							'2.2.0+rev1',
						),
					).to.equal('resinhup12');
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'1.26.0',
							'2.3.0+rev1',
						),
					).to.equal('resinhup12');
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'1.26.0',
							'2.5.0+rev1',
						),
					).to.equal('resinhup12');
				});
			});

			it('Should return resinhup12 for supported hup versions for special device types', () => {
				SPECIAL_BEAGLEBONE_DEVICES.forEach((deviceType) => {
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'1.30.1',
							'2.2.0+rev1',
						),
					).to.equal('resinhup12');
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'1.30.1',
							'2.3.0+rev1',
						),
					).to.equal('resinhup12');
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'1.30.1',
							'2.5.0+rev1',
						),
					).to.equal('resinhup12');
				});
			});
		});

		describe('v2 -> v2', () => {
			it('Should error when hup between the provided versions is not supported', () => {
				['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
					expect(() =>
						hupActionHelper.getHUPActionType(
							deviceType,
							'2.0.0+rev0.prod',
							'2.2.0+rev1.prod',
						),
					).to.throw('Current OS version must be >= 2.0.0+rev1');
					expect(() =>
						hupActionHelper.getHUPActionType(
							deviceType,
							'2.1.0+rev1.prod',
							'2.1.1+rev1.prod',
						),
					).to.throw('Target OS version must be >= 2.2.0+rev1');
					expect(() =>
						hupActionHelper.getHUPActionType(
							deviceType,
							'2.1.0+rev1.prod',
							'2.2.0+rev0.prod',
						),
					).to.throw('Target OS version must be >= 2.2.0+rev1');
				});
			});

			it('Should error when hup between the provided versions is not supported for special device types', () => {
				['jetson-tx2', 'skx2'].forEach((deviceType) => {
					expect(() =>
						hupActionHelper.getHUPActionType(
							deviceType,
							'2.0.0+rev0.prod',
							'2.2.0+rev1.prod',
						),
					).to.throw('Current OS version must be >= 2.7.4');
					expect(() =>
						hupActionHelper.getHUPActionType(
							deviceType,
							'2.1.0+rev1.prod',
							'2.1.1+rev1.prod',
						),
					).to.throw('Current OS version must be >= 2.7.4');
					expect(() =>
						hupActionHelper.getHUPActionType(
							deviceType,
							'2.1.0+rev1.prod',
							'2.2.0+rev0.prod',
						),
					).to.throw('Current OS version must be >= 2.7.4');
					expect(() =>
						hupActionHelper.getHUPActionType(
							deviceType,
							'2.7.3+rev1.prod',
							'2.29.0+rev1.prod',
						),
					).to.throw('Current OS version must be >= 2.7.4');
				});
			});

			it('Should return balenahup for supported v2 -> v2 hup versions', () => {
				['raspberry-pi', 'raspberrypi3', 'beaglebone-pocket'].forEach(
					(deviceType) => {
						expect(
							hupActionHelper.getHUPActionType(
								deviceType,
								'2.0.0+rev1.prod',
								'2.2.0+rev1.prod',
							),
						).to.equal('balenahup');
						expect(
							hupActionHelper.getHUPActionType(
								deviceType,
								'2.1.0+rev1.prod',
								'2.2.0+rev1.prod',
							),
						).to.equal('balenahup');
						expect(
							hupActionHelper.getHUPActionType(
								deviceType,
								'2.0.0+rev1.prod',
								'2.29.2+rev1.prod',
							),
						).to.equal('balenahup');
						expect(
							hupActionHelper.getHUPActionType(
								deviceType,
								'2.9.6+rev2.prod',
								'2.29.2+rev1.prod',
							),
						).to.equal('balenahup');
					},
				);
			});

			it('Should return balenahup for supported v2 -> v2 hup versions for special device types', () => {
				['jetson-tx2', 'skx2'].forEach((deviceType) => {
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'2.7.4',
							'2.29.0+rev1.prod',
						),
					).to.equal('balenahup');
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'2.7.4+rev1.prod',
							'2.29.0+rev1.prod',
						),
					).to.equal('balenahup');
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'2.7.4+rev1.prod',
							'2.7.8+rev1.prod',
						),
					).to.equal('balenahup');
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'2.9.6+rev2.prod',
							'2.29.2+rev1.prod',
						),
					).to.equal('balenahup');
				});
			});
		});

		describe('v2 -> ESR', () => {
			it('Should return balenahup for supported v2 -> ESR hup versions', () => {
				['raspberry-pi', 'raspberrypi3', 'beaglebone-pocket'].forEach(
					(deviceType) => {
						expect(
							hupActionHelper.getHUPActionType(
								deviceType,
								'2.0.0+rev1.prod',
								'2019.07.0.prod',
							),
						).to.equal('balenahup');
						expect(
							hupActionHelper.getHUPActionType(
								deviceType,
								'2.1.0+rev1.prod',
								'2019.07.0.prod',
							),
						).to.equal('balenahup');
						expect(
							hupActionHelper.getHUPActionType(
								deviceType,
								'2.0.0+rev1.prod',
								'2019.07.0.prod',
							),
						).to.equal('balenahup');
						expect(
							hupActionHelper.getHUPActionType(
								deviceType,
								'2.9.6+rev2.prod',
								'2019.07.0.prod',
							),
						).to.equal('balenahup');
					},
				);
			});

			it('Should return balenahup for supported v2 -> ESR hup versions for special device types', () => {
				['jetson-tx2', 'skx2'].forEach((deviceType) => {
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'2.7.4',
							'2019.07.0.prod',
						),
					).to.equal('balenahup');
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'2.7.4+rev1.prod',
							'2019.07.0.prod',
						),
					).to.equal('balenahup');
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'2.9.6+rev2.prod',
							'2019.07.0.prod',
						),
					).to.equal('balenahup');
				});
			});
		});

		describe('ESR -> ESR', () => {
			it('Should return balenahup for supported ESR -> ESR hup versions', () => {
				['raspberry-pi', 'raspberrypi3', 'beaglebone-pocket'].forEach(
					(deviceType) => {
						expect(
							hupActionHelper.getHUPActionType(
								deviceType,
								'2019.07.0.prod',
								'2019.07.1.prod',
							),
						).to.equal('balenahup');
						expect(
							hupActionHelper.getHUPActionType(
								deviceType,
								'2019.07.0.prod',
								'2019.11.0.prod',
							),
						).to.equal('balenahup');
						expect(
							hupActionHelper.getHUPActionType(
								deviceType,
								'2019.07.0.prod',
								'2019.11.1.prod',
							),
						).to.equal('balenahup');
						expect(
							hupActionHelper.getHUPActionType(
								deviceType,
								'2019.07.0.prod',
								'2020.07.0.prod',
							),
						).to.equal('balenahup');
					},
				);
			});

			it('Should return balenahup for supported ESR -> ESR hup versions for special device types', () => {
				['jetson-tx2', 'skx2'].forEach((deviceType) => {
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'2019.07.0.prod',
							'2019.07.1.prod',
						),
					).to.equal('balenahup');
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'2019.07.0.prod',
							'2019.11.0.prod',
						),
					).to.equal('balenahup');
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'2019.07.0.prod',
							'2019.11.1.prod',
						),
					).to.equal('balenahup');
					expect(
						hupActionHelper.getHUPActionType(
							deviceType,
							'2019.07.0.prod',
							'2020.07.0.prod',
						),
					).to.equal('balenahup');
				});
			});
		});

		it('Should error when attempting v1 -> v3 hup', () => {
			['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
				expect(() =>
					hupActionHelper.getHUPActionType(
						deviceType,
						'1.30.1',
						'3.0.1+rev1.prod',
					),
				).to.throw(
					`This update request cannot be performed from 1.30.1 to 3.0.1+rev1.prod`,
				);
			});
		});

		it('Should return balenahup when attempting v2 -> v3 hup', () => {
			['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
				expect(
					hupActionHelper.getHUPActionType(
						deviceType,
						'2.9.6+rev2.prod',
						'3.0.1+rev1.prod',
					),
				).to.equal('balenahup');
			});
		});

		it('Should return balenahup when attempting v3 -> v3 hup', () => {
			['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
				expect(
					hupActionHelper.getHUPActionType(
						deviceType,
						'3.0.0+rev1.prod',
						'3.0.1+rev1.prod',
					),
				).to.equal('balenahup');
			});
		});

		describe('takeover', () => {
			[
				{
					deviceType: 'jetson-xavier-nx-devkit-emmc',
					before: '6.0.0',
					cutoff: '6.0.38',
					takeover: '6.0.39',
					takeoverVariants: {
						// pre-unification versions used by balena-proxy
						invalidSemverDev: '6.0.39.dev',
						invalidSemverProd: '6.0.39.prod',
						// balena-semver considers '+dev' a kind of pre-release
						// relative to a no-variant version like 6.0.39.
						noRev: '6.0.39+dev',
						rev1Dev: '6.0.39+rev1.dev',
					},
					after: '6.1.0',
				},
			].forEach(
				({ deviceType, before, cutoff, takeover, takeoverVariants, after }) => {
					it(`should return 'balenahup' if doing HUP for ${deviceType} from a version before ${takeover} to a version before ${takeover}`, () => {
						expect(
							hupActionHelper.getHUPActionType(deviceType, before, cutoff),
						).to.equal('balenahup');
					});

					it(`should return 'takeover' if doing HUP for ${deviceType} from a version before ${takeover} to a version after ${takeover}`, () => {
						expect(
							hupActionHelper.getHUPActionType(deviceType, before, after),
						).to.equal('takeover');
					});

					it(`should return 'balenahup' if doing HUP for ${deviceType} from ${takeover} to a version after ${takeover}`, () => {
						expect(
							hupActionHelper.getHUPActionType(deviceType, takeover, after),
						).to.equal('balenahup');
					});

					it(`should return 'balenahup' if doing HUP for ${deviceType} from ${takeover} (dev mode) to a version after ${takeover}`, () => {
						expect(
							hupActionHelper.getHUPActionType(
								deviceType,
								takeoverVariants.invalidSemverDev,
								after,
							),
						).to.equal('balenahup');
					});
					it(`should return 'balenahup' if doing HUP for ${deviceType} from ${takeover} (prod mode) to a version after ${takeover}`, () => {
						expect(
							hupActionHelper.getHUPActionType(
								deviceType,
								takeoverVariants.invalidSemverProd,
								after,
							),
						).to.equal('balenahup');
					});

					it(`should return 'takeover' if doing HUP for ${deviceType} from '${takeover}+dev' to a version after ${takeover}`, () => {
						expect(
							hupActionHelper.getHUPActionType(
								deviceType,
								takeoverVariants.noRev,
								after,
							),
						).to.equal('takeover');
					});

					it(`should return 'balenahup' if doing HUP for ${deviceType} from '${takeover}+rev1' (dev mode) to another version after ${takeover}`, () => {
						expect(
							hupActionHelper.getHUPActionType(
								deviceType,
								takeoverVariants.rev1Dev,
								after,
							),
						).to.equal('balenahup');
					});
				},
			);
		});
	});
});
