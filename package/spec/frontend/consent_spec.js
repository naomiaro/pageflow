import {Consent} from 'pageflow/frontend/Consent';
import {consent} from 'pageflow/frontend';
import {flushPromises} from '$support/flushPromises';

describe('consent', () => {
  it('resolves require call after all vendors have been accepted', async () => {
    const consent = new Consent();

    consent.registerVendor('XY Analytics', {paradigm: 'opt-in'});
    consent.closeVendorRegistration();
    const promise = consent.require('XY Analytics');
    const {acceptAll} = await consent.requested();
    acceptAll();

    return expect(promise).resolves.toEqual('fulfilled');
  });

  it('ignores not-required vendors on acceptAll', async () => {
    const consent = new Consent();

    consent.registerVendor('XY Analytics', {paradigm: 'opt-in'});
    consent.closeVendorRegistration();
    const {acceptAll} = await consent.requested();

    expect(acceptAll).not.toThrow();
  });

  it('resolves require call after vendors have all been denied', async () => {
    const consent = new Consent();

    consent.registerVendor('XY Analytics', {paradigm: 'opt-in'});
    consent.closeVendorRegistration();
    const promise = consent.require('XY Analytics');
    const {denyAll} = await consent.requested();
    denyAll();

    return expect(promise).resolves.toEqual('failed');
  });

  it('resolves require call after vendors have been saved', async () => {
    const consent = new Consent();

    consent.registerVendor('xy_analytics', {paradigm: 'opt-in'});
    consent.registerVendor('yz_analytics', {paradigm: 'opt-in'});
    consent.closeVendorRegistration();
    const xyPromise = consent.require('xy_analytics');
    const yzPromise = consent.require('yz_analytics');
    const {save} = await consent.requested();
    save({xy_analytics: false, yz_analytics: true});

    await expect(xyPromise).resolves.toEqual('failed');
    await expect(yzPromise).resolves.toEqual('fulfilled');
  });

  it('resolves require call if vendor has skip paradigm', async () => {
    const consent = new Consent();

    consent.registerVendor('XY Analytics', {paradigm: 'skip'});
    consent.closeVendorRegistration();
    const promise = consent.require('XY Analytics');

    return expect(promise).resolves.toEqual('fulfilled');
  });

  it('does not request if no vendors registered', async () => {
    const consent = new Consent();
    const callback = jest.fn();

    consent.closeVendorRegistration();
    consent.requested().then(callback);
    await flushPromises();

    expect(callback).not.toHaveBeenCalled();
  });

  it('requests only after vendor registration has been closed', async () => {
    const consent = new Consent();
    const callback = jest.fn();

    consent.registerVendor('XY Analytics', {paradigm: 'opt-in'});
    consent.requested().then(callback);
    await flushPromises();

    expect(callback).not.toHaveBeenCalled();

    consent.closeVendorRegistration();
    await flushPromises();

    expect(callback).toHaveBeenCalled();
  });

  it('does not request if paradigm is skip', async () => {
    const consent = new Consent();
    const callback = jest.fn();

    consent.registerVendor('XY Analytics', {paradigm: 'skip'});
    consent.closeVendorRegistration();
    consent.requested().then(callback);
    await flushPromises();

    expect(callback).not.toHaveBeenCalled();
  });

  it('returns requested opt-in vendors', async () => {
    const consent = new Consent();

    consent.registerVendor('xy_analytics', {paradigm: 'opt-in'});
    consent.closeVendorRegistration();

    const result = await consent.requested();

    expect(result.vendors).toMatchObject([{name: 'xy_analytics'}]);
  });

  it('returns display name with requested opt-in vendors', async () => {
    const consent = new Consent();

    consent.registerVendor('xy_analytics', {
      displayName: 'XY Analytics',
      paradigm: 'opt-in'
    });
    consent.closeVendorRegistration();

    const result = await consent.requested();

    expect(result.vendors).toMatchObject([{displayName: 'XY Analytics'}]);
  });

  it('does not return skipped vendors from requested', async () => {
    const consent = new Consent();

    consent.registerVendor('xy_analytics', {paradigm: 'opt-in'});
    consent.registerVendor('za_analytics', {paradigm: 'skip'});
    consent.closeVendorRegistration();

    const result = await consent.requested();

    expect(result.vendors).toMatchObject([{name: 'xy_analytics'}]);
  });

  it('throws error if paradigm invalid', () => {
    const consent = new Consent();

    expect(() =>
      consent.registerVendor('XY Analytics', {paradigm: 'rainbow'})
    ).toThrow(/unknown paradigm/);
  });

  it('throws error if vendor is registered after registration has been closed', () => {
    const consent = new Consent();

    consent.closeVendorRegistration();

    expect(() =>
      consent.registerVendor('XY Analytics', {paradigm: 'opt-in'})
    ).toThrow(/registered after registration has been closed/);
  });

  it('exports singleton consent object', () => {
    expect(consent).toBeDefined();
  });
});
