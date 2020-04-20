import { chai } from 'mochainon';
import { HUPActionHelper } from '../lib/index';

const { expect } = chai;

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

	describe('.isSupportedOsUpdate()', () => {
		it('Should not allow non-semver versions', () => {
			expect(
				hupActionHelper.isSupportedOsUpdate(
					'raspberry-pi',
					'2.9.6.7',
					'2.29.2+rev1.prod',
				),
			).to.equal(false);
			expect(
				hupActionHelper.isSupportedOsUpdate(
					'raspberry-pi',
					'2.9.6+rev2.prod',
					'2.29.2.3',
				),
			).to.equal(false);
		});

		it('Should not allow .dev versions', () => {
			expect(
				hupActionHelper.isSupportedOsUpdate(
					'raspberry-pi',
					'2.9.6+rev2.dev',
					'2.29.2+rev1.prod',
				),
			).to.equal(false);
			expect(
				hupActionHelper.isSupportedOsUpdate(
					'raspberry-pi',
					'2.9.6+rev2.prod',
					'2.29.2+rev1.dev',
				),
			).to.equal(false);
		});

		it('Should not allow pre-release versions', () => {
			expect(
				hupActionHelper.isSupportedOsUpdate(
					'raspberry-pi',
					'2.9.6-rc1.rev1',
					'2.29.2+rev1.prod',
				),
			).to.equal(false);
			expect(
				hupActionHelper.isSupportedOsUpdate(
					'raspberry-pi',
					'2.9.6+rev2.prod',
					'2.29.2-rc1.rev1',
				),
			).to.equal(false);
		});

		it('Should not allow downgrades', () => {
			expect(
				hupActionHelper.isSupportedOsUpdate(
					'raspberry-pi',
					'2.29.2+rev1.prod',
					'2.9.6+rev2.prod',
				),
			).to.equal(false);
		});

		it('Should return false when the versions are the same', () => {
			expect(
				hupActionHelper.isSupportedOsUpdate(
					'raspberry-pi',
					'2.9.6+rev2.prod',
					'2.9.6+rev2.prod',
				),
			).to.equal(false);
		});

		it('Should return false when the device type does not support hup at all', () => {
			expect(
				hupActionHelper.isSupportedOsUpdate(
					'non-hup-able-device-type',
					'1.8.0',
					'1.26.0',
				),
			).to.equal(false);

			expect(
				hupActionHelper.isSupportedOsUpdate(
					'non-hup-able-device-type',
					'1.30.1',
					'2.2.0+rev1',
				),
			).to.equal(false);

			// On version 2.x and above all device types must be supported
		});

		describe('v1 -> v1', () => {
			it('Should return false when hup is not supported', () => {
				['artik530', 'beaglebone-pocket'].forEach((deviceType) => {
					expect(
						hupActionHelper.isSupportedOsUpdate(deviceType, '1.7.0', '1.26.0'),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(deviceType, '1.8.0', '1.25.0'),
					).to.equal(false);
				});
			});

			it('Should return false when hup between the provided versions is not supported', () => {
				['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
					expect(
						hupActionHelper.isSupportedOsUpdate(deviceType, '1.7.0', '1.26.0'),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(deviceType, '1.8.0', '1.25.0'),
					).to.equal(false);
				});
			});

			it('Should return true when device specific v1 -> v1 hup is supported', () => {
				['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
					expect(
						hupActionHelper.isSupportedOsUpdate(deviceType, '1.8.0', '1.26.0'),
					).to.equal(true);
					expect(
						hupActionHelper.isSupportedOsUpdate(deviceType, '1.9.0', '1.27.0'),
					).to.equal(true);
					expect(
						hupActionHelper.isSupportedOsUpdate(deviceType, '1.26.0', '1.27.0'),
					).to.equal(true);
				});
			});
		});

		describe('v1 -> v2', () => {
			it('Should return false when hup is not supported', () => {
				['artik530'].forEach((deviceType) => {
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.7.0',
							'2.3.0+rev1',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.8.0',
							'2.1.0+rev1',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.8.0',
							'2.2.0+rev0',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.8.0',
							'2.5.0+rev1',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.8.0',
							'2.5.1+rev0',
						),
					).to.equal(false);

					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.8.0',
							'2.5.1+rev1',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.30.1',
							'2.5.1+rev1',
						),
					).to.equal(false);
				});
			});

			it('Should return false when hup between the provided versions is not supported', () => {
				['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.7.0',
							'2.3.0+rev1',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.8.0',
							'2.1.0+rev1',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.8.0',
							'2.2.0+rev0',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.8.0',
							'2.5.1+rev1',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.8.0',
							'2.5.1+rev2',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.8.0',
							'2.5.2+rev1',
						),
					).to.equal(false);
				});
			});

			it('Should return false when hup between the provided versions is not supported for special device types', () => {
				SPECIAL_BEAGLEBONE_DEVICES.forEach((deviceType) => {
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.7.0',
							'2.3.0+rev1',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.8.0',
							'2.3.0+rev1',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.30.0',
							'2.3.0+rev1',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.30.1',
							'2.1.0+rev1',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.30.1',
							'2.2.0+rev0',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.30.1',
							'2.5.1+rev1',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.30.1',
							'2.5.1+rev2',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.30.1',
							'2.5.2+rev1',
						),
					).to.equal(false);
				});
			});

			it('Should return true for supported hup versions', () => {
				['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.8.0',
							'2.2.0+rev1',
						),
					).to.equal(true);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.8.0',
							'2.3.0+rev1',
						),
					).to.equal(true);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.8.0',
							'2.5.0+rev1',
						),
					).to.equal(true);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.26.0',
							'2.2.0+rev1',
						),
					).to.equal(true);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.26.0',
							'2.3.0+rev1',
						),
					).to.equal(true);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.26.0',
							'2.5.0+rev1',
						),
					).to.equal(true);
				});
			});

			it('Should return true for supported hup versions for special device types', () => {
				SPECIAL_BEAGLEBONE_DEVICES.forEach((deviceType) => {
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.30.1',
							'2.2.0+rev1',
						),
					).to.equal(true);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.30.1',
							'2.3.0+rev1',
						),
					).to.equal(true);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'1.30.1',
							'2.5.0+rev1',
						),
					).to.equal(true);
				});
			});
		});

		describe('v2 -> v2', () => {
			it('Should return false when hup between the provided versions is not supported', () => {
				['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'2.0.0+rev0.prod',
							'2.2.0+rev1.prod',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'2.1.0+rev1.prod',
							'2.1.1+rev1.prod',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'2.1.0+rev1.prod',
							'2.2.0+rev0.prod',
						),
					).to.equal(false);
				});
			});

			it('Should return false when hup between the provided versions is not supported for special device types', () => {
				['jetson-tx2', 'skx2'].forEach((deviceType) => {
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'2.0.0+rev0.prod',
							'2.2.0+rev1.prod',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'2.1.0+rev1.prod',
							'2.1.1+rev1.prod',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'2.1.0+rev1.prod',
							'2.2.0+rev0.prod',
						),
					).to.equal(false);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'2.7.3+rev1.prod',
							'2.29.0+rev1.prod',
						),
					).to.equal(false);
				});
			});

			it('Should return true for supported v2 -> v2 hup versions', () => {
				['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'2.0.0+rev1.prod',
							'2.2.0+rev1.prod',
						),
					).to.equal(true);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'2.1.0+rev1.prod',
							'2.2.0+rev1.prod',
						),
					).to.equal(true);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'2.0.0+rev1.prod',
							'2.29.2+rev1.prod',
						),
					).to.equal(true);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'2.9.6+rev2.prod',
							'2.29.2+rev1.prod',
						),
					).to.equal(true);
				});
			});

			it('Should return true for supported v1 -> v2 hup versions for special device types', () => {
				['jetson-tx2', 'skx2'].forEach((deviceType) => {
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'2.7.4',
							'2.29.0+rev1.prod',
						),
					).to.equal(true);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'2.7.4+rev1.prod',
							'2.29.0+rev1.prod',
						),
					).to.equal(true);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'2.7.4+rev1.prod',
							'2.7.8+rev1.prod',
						),
					).to.equal(true);
					expect(
						hupActionHelper.isSupportedOsUpdate(
							deviceType,
							'2.9.6+rev2.prod',
							'2.29.2+rev1.prod',
						),
					).to.equal(true);
				});
			});
		});

		it('Should return false when attempting v1 -> v3 hup', () => {
			['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
				expect(
					hupActionHelper.isSupportedOsUpdate(
						deviceType,
						'1.30.1',
						'3.0.1+rev1.prod',
					),
				).to.equal(false);
			});
		});

		it('Should return true when attempting v2 -> v3 hup', () => {
			['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
				expect(
					hupActionHelper.isSupportedOsUpdate(
						deviceType,
						'2.9.6+rev2.prod',
						'3.0.1+rev1.prod',
					),
				).to.equal(true);
			});
		});

		it('Should return true when attempting v3 -> v3 hup', () => {
			['raspberry-pi', 'raspberrypi3'].forEach((deviceType) => {
				expect(
					hupActionHelper.isSupportedOsUpdate(
						deviceType,
						'3.0.0+rev1.prod',
						'3.0.1+rev1.prod',
					),
				).to.equal(true);
			});
		});
	});
});
