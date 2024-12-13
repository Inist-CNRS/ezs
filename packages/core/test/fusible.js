import {
    createFusible,
    enableFusible,
    checkFusible,
    disableFusible
} from '../src/fusible';

test('fusible', async () => {
    const fusible = await createFusible();
    expect(fusible).toMatch(/.+/);
    const isEnable = await enableFusible(fusible);
    expect(isEnable).toBeTruthy();
    const isCheckOK = await checkFusible(fusible);
    expect(isCheckOK).toBeTruthy();
    const isDisable = await disableFusible(fusible);
    expect(isDisable).toBeTruthy();
    const isDisableBIS = await disableFusible(fusible);
    expect(isDisableBIS).toBeTruthy();
    const isCheckKO = await checkFusible(fusible);
    expect(isCheckKO).not.toBeTruthy();
});

