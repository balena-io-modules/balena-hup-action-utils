import { chai } from 'mochainon';
import * as hupActionUtils from '../lib/index';

const { expect } = chai;

const SPECIAL_BEAGLEBONE_DEVICES = [
	'beaglebone-black',
	'beaglebone-green',
	'beaglebone-green-wifi',
];

describe('BalenaHupActionUtils', () => {
	describe('.getHUPActionType()', () => {
		it('Should not allow non-semver versions', () => {
			expect(() =>
				hupActionUtils.getHUPActionType(
					'raspberry-pi',
					'2.9.6.7',
					'2.29.2+rev1.prod',
				),
			).to.throw('Invalid current balenaOS version');
			expect(() =>
				hupActionUtils.getHUPActionType(
					'raspberry-pi',
					'2.9.6+rev2.prod',
					'2.29.2.3',
				),
			).to.throw('Invalid target balenaOS version');
		});

		it('Should not allow .dev versions', () => {
			expect(() =>
				hupActionUtils.getHUPActionType(
					'raspberry-pi',
					'2.9.6+rev2.dev',
					'2.29.2+rev1.prod',
				),
			).to.throw(
				'Updates cannot be performed on development balenaOS variants',
			);
			expect(() =>
				hupActionUtils.getHUPActionType(
					'raspberry-pi',
					'2.9.6+rev2.prod',
					'2.29.2+rev1.dev',
				),
			).to.throw(
				'Updates cannot be performed on development balenaOS variants',
			);
		});

		it('Should not allow pre-release versions', () => {
			expect(() =>
				hupActionUtils.getHUPActionType(
					'raspberry-pi',
					'2.9.6-rc1.rev1',
					'2.29.2+rev1.prod',
				),
			).to.throw(
				'Updates cannot be performed on pre-release balenaOS versions',
			);
			expect(() =>
				hupActionUtils.getHUPActionType(
					'raspberry-pi',
					'2.9.6+rev2.prod',
					'2.29.2-rc1.rev1',
				),
			).to.throw(
				'Updates cannot be performed on pre-release balenaOS versions',
			);
		});

		it('Should not allow downgrades', () => {
			expect(() =>
				hupActionUtils.getHUPActionType(
					'raspberry-pi',
					'2.29.2+rev1.prod',
					'2.9.6+rev2.prod',
				),
			).to.throw('OS downgrades are not allowed');
		});

		it('Should error when the versions are the same', () => {
			expect(() =>
				hupActionUtils.getHUPActionType(
					'raspberry-pi',
					'2.9.6+rev2.prod',
					'2.9.6+rev2.prod',
				),
			).to.throw('Current OS version matches Target OS version');
		});

		it('Should error when the device type does not support hup at all', () => {
			expect(() =>
				hupActionUtils.getHUPActionType(
					'non-hup-able-device-type',
					'1.8.0',
					'1.26.0',
				),
			).to.throw(
				`This update request cannot be performed on 'non-hup-able-device-type'`,
			);

			expect(() =>
				hupActionUtils.getHUPActionType(
					'non-hup-able-device-type',
					'1.30.1',
					'2.2.0+rev1',
				),
			).to.throw(
				`This update request cannot be performed on 'non-hup-able-device-type'`,
			);

			expect(() =>
				hupActionUtils.getHUPActionType(
					'non-hup-able-device-type',
					'2.9.6+rev2.prod',
					'2.29.2+rev1.prod',
				),
			).to.throw(
				`This update request cannot be performed on 'non-hup-able-device-type'`,
			);
		});

		describe('v1 -> v1', () => {
			it('Should error when hup is not supported', () => {
				['artik530', 'beaglebone-pocket'].forEach(deviceType => {
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.7.0', '1.26.0'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '1.25.0'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);
				});
			});

			it('Should error when hup between the provided versions is not supported', () => {
				['raspberry-pi', 'raspberrypi3'].forEach(deviceType => {
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.7.0', '1.26.0'),
					).to.throw('Current OS version must be >= 1.8.0');
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '1.25.0'),
					).to.throw('Target OS version must be >= 1.26.0');
				});
			});

			it('Should return resinhup11 when device specific v1 -> v1 hup is supported', () => {
				['raspberry-pi', 'raspberrypi3'].forEach(deviceType => {
					expect(
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '1.26.0'),
					).to.equal('resinhup11');
					expect(
						hupActionUtils.getHUPActionType(deviceType, '1.9.0', '1.27.0'),
					).to.equal('resinhup11');
					expect(
						hupActionUtils.getHUPActionType(deviceType, '1.26.0', '1.27.0'),
					).to.equal('resinhup11');
				});
			});
		});

		describe('v1 -> v2', () => {
			it('Should error when hup is not supported', () => {
				['artik530'].forEach(deviceType => {
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.7.0', '2.3.0+rev1'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '2.1.0+rev1'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '2.2.0+rev0'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '2.5.0+rev1'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '2.5.1+rev0'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);

					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '2.5.1+rev1'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.30.1', '2.5.1+rev1'),
					).to.throw(
						`This update request cannot be performed on '${deviceType}'`,
					);
				});
			});

			it('Should error when hup between the provided versions is not supported', () => {
				['raspberry-pi', 'raspberrypi3'].forEach(deviceType => {
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.7.0', '2.3.0+rev1'),
					).to.throw('Current OS version must be >= 1.8.0');
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '2.1.0+rev1'),
					).to.throw('Target OS version must be >= 2.2.0+rev1');
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '2.2.0+rev0'),
					).to.throw('Target OS version must be >= 2.2.0+rev1');
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '2.5.1+rev1'),
					).to.throw('Target OS version must be < 2.5.1+rev1');
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '2.5.1+rev2'),
					).to.throw('Target OS version must be < 2.5.1+rev1');
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '2.5.2+rev1'),
					).to.throw('Target OS version must be < 2.5.1+rev1');
				});
			});

			it('Should error when hup between the provided versions is not supported for special device types', () => {
				SPECIAL_BEAGLEBONE_DEVICES.forEach(deviceType => {
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.7.0', '2.3.0+rev1'),
					).to.throw('Current OS version must be >= 1.30.1');
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '2.3.0+rev1'),
					).to.throw('Current OS version must be >= 1.30.1');
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.30.0', '2.3.0+rev1'),
					).to.throw('Current OS version must be >= 1.30.1');
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.30.1', '2.1.0+rev1'),
					).to.throw('Target OS version must be >= 2.2.0+rev1');
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.30.1', '2.2.0+rev0'),
					).to.throw('Target OS version must be >= 2.2.0+rev1');
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.30.1', '2.5.1+rev1'),
					).to.throw('Target OS version must be < 2.5.1+rev1');
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.30.1', '2.5.1+rev2'),
					).to.throw('Target OS version must be < 2.5.1+rev1');
					expect(() =>
						hupActionUtils.getHUPActionType(deviceType, '1.30.1', '2.5.2+rev1'),
					).to.throw('Target OS version must be < 2.5.1+rev1');
				});
			});

			it('Should return resinhup12 for supported hup versions', () => {
				['raspberry-pi', 'raspberrypi3'].forEach(deviceType => {
					expect(
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '2.2.0+rev1'),
					).to.equal('resinhup12');
					expect(
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '2.3.0+rev1'),
					).to.equal('resinhup12');
					expect(
						hupActionUtils.getHUPActionType(deviceType, '1.8.0', '2.5.0+rev1'),
					).to.equal('resinhup12');
					expect(
						hupActionUtils.getHUPActionType(deviceType, '1.26.0', '2.2.0+rev1'),
					).to.equal('resinhup12');
					expect(
						hupActionUtils.getHUPActionType(deviceType, '1.26.0', '2.3.0+rev1'),
					).to.equal('resinhup12');
					expect(
						hupActionUtils.getHUPActionType(deviceType, '1.26.0', '2.5.0+rev1'),
					).to.equal('resinhup12');
				});
			});

			it('Should return resinhup12 for supported hup versions for special device types', () => {
				SPECIAL_BEAGLEBONE_DEVICES.forEach(deviceType => {
					expect(
						hupActionUtils.getHUPActionType(deviceType, '1.30.1', '2.2.0+rev1'),
					).to.equal('resinhup12');
					expect(
						hupActionUtils.getHUPActionType(deviceType, '1.30.1', '2.3.0+rev1'),
					).to.equal('resinhup12');
					expect(
						hupActionUtils.getHUPActionType(deviceType, '1.30.1', '2.5.0+rev1'),
					).to.equal('resinhup12');
				});
			});
		});

		describe('v2 -> v2', () => {
			it('Should error when hup between the provided versions is not supported', () => {
				['raspberry-pi', 'raspberrypi3'].forEach(deviceType => {
					expect(() =>
						hupActionUtils.getHUPActionType(
							deviceType,
							'2.0.0+rev0.prod',
							'2.2.0+rev1.prod',
						),
					).to.throw('Current OS version must be >= 2.0.0+rev1');
					expect(() =>
						hupActionUtils.getHUPActionType(
							deviceType,
							'2.1.0+rev1.prod',
							'2.1.1+rev1.prod',
						),
					).to.throw('Target OS version must be >= 2.2.0+rev1');
					expect(() =>
						hupActionUtils.getHUPActionType(
							deviceType,
							'2.1.0+rev1.prod',
							'2.2.0+rev0.prod',
						),
					).to.throw('Target OS version must be >= 2.2.0+rev1');
				});
			});

			it('Should error when hup between the provided versions is not supported for special device types', () => {
				['jetson-tx2', 'skx2'].forEach(deviceType => {
					expect(() =>
						hupActionUtils.getHUPActionType(
							deviceType,
							'2.0.0+rev0.prod',
							'2.2.0+rev1.prod',
						),
					).to.throw('Current OS version must be >= 2.7.4');
					expect(() =>
						hupActionUtils.getHUPActionType(
							deviceType,
							'2.1.0+rev1.prod',
							'2.1.1+rev1.prod',
						),
					).to.throw('Current OS version must be >= 2.7.4');
					expect(() =>
						hupActionUtils.getHUPActionType(
							deviceType,
							'2.1.0+rev1.prod',
							'2.2.0+rev0.prod',
						),
					).to.throw('Current OS version must be >= 2.7.4');
					expect(() =>
						hupActionUtils.getHUPActionType(
							deviceType,
							'2.7.3+rev1.prod',
							'2.29.0+rev1.prod',
						),
					).to.throw('Current OS version must be >= 2.7.4');
				});
			});

			it('Should return resinhup22 for supported v2 -> v2 hup versions', () => {
				['raspberry-pi', 'raspberrypi3'].forEach(deviceType => {
					expect(
						hupActionUtils.getHUPActionType(
							deviceType,
							'2.0.0+rev1.prod',
							'2.2.0+rev1.prod',
						),
					).to.equal('resinhup22');
					expect(
						hupActionUtils.getHUPActionType(
							deviceType,
							'2.1.0+rev1.prod',
							'2.2.0+rev1.prod',
						),
					).to.equal('resinhup22');
					expect(
						hupActionUtils.getHUPActionType(
							deviceType,
							'2.0.0+rev1.prod',
							'2.29.2+rev1.prod',
						),
					).to.equal('resinhup22');
					expect(
						hupActionUtils.getHUPActionType(
							deviceType,
							'2.9.6+rev2.prod',
							'2.29.2+rev1.prod',
						),
					).to.equal('resinhup22');
				});
			});

			it('Should return resinhup22 for supported v1 -> v2 hup versions for special device types', () => {
				['jetson-tx2', 'skx2'].forEach(deviceType => {
					expect(
						hupActionUtils.getHUPActionType(
							deviceType,
							'2.7.4',
							'2.29.0+rev1.prod',
						),
					).to.equal('resinhup22');
					expect(
						hupActionUtils.getHUPActionType(
							deviceType,
							'2.7.4+rev1.prod',
							'2.29.0+rev1.prod',
						),
					).to.equal('resinhup22');
					expect(
						hupActionUtils.getHUPActionType(
							deviceType,
							'2.7.4+rev1.prod',
							'2.7.8+rev1.prod',
						),
					).to.equal('resinhup22');
					expect(
						hupActionUtils.getHUPActionType(
							deviceType,
							'2.9.6+rev2.prod',
							'2.29.2+rev1.prod',
						),
					).to.equal('resinhup22');
				});
			});
		});

		it('Should error when attemptiong v1 -> v3 hup', () => {
			['raspberry-pi', 'raspberrypi3'].forEach(deviceType => {
				expect(() =>
					hupActionUtils.getHUPActionType(
						deviceType,
						'1.30.1',
						'3.0.1+rev1.prod',
					),
				).to.throw(
					`This update request cannot be performed on '${deviceType}'`,
				);
			});
		});

		it('Should error when attemptiong v2 -> v3 hup', () => {
			['raspberry-pi', 'raspberrypi3'].forEach(deviceType => {
				expect(() =>
					hupActionUtils.getHUPActionType(
						deviceType,
						'2.9.6+rev2.prod',
						'3.0.1+rev1.prod',
					),
				).to.throw(
					`This update request cannot be performed on '${deviceType}'`,
				);
			});
		});

		it('Should error when attemptiong v3 -> v3 hup', () => {
			['raspberry-pi', 'raspberrypi3'].forEach(deviceType => {
				expect(() =>
					hupActionUtils.getHUPActionType(
						deviceType,
						'3.0.0+rev1.prod',
						'3.0.1+rev1.prod',
					),
				).to.throw(
					`This update request cannot be performed on '${deviceType}'`,
				);
			});
		});
	});
});