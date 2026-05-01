import {
    createFusible,
    enableFusible,
    checkFusible,
    disableFusible,
    watchFusible,
} from '../src/fusible';

test('fusible', async () => {
    const fusible = await createFusible();
    expect(fusible).toMatch(/.+/);
    const isEnable = await enableFusible(fusible);
    expect(isEnable).toBe(true);
    const isCheckOK = await checkFusible(fusible);
    expect(isCheckOK).toBe(true);
    const isDisable = await disableFusible(fusible);
    expect(isDisable).toBe(true);
    const isDisableBIS = await disableFusible(fusible);
    expect(isDisableBIS).toBe(true);
    const isCheckKO = await checkFusible(fusible);
    expect(isCheckKO).toBe(false);
    const isCheckKOBIS = await checkFusible();
    expect(isCheckKOBIS).toBe(false);
    const isNotCorrect = await watchFusible()
    expect(isNotCorrect).toBe(false);
});

test('fusible (watch)', async () => {
    const fusible = await createFusible();
    expect(fusible).toMatch(/.+/);

    let isWatched = false;
    watchFusible(fusible, () => {
        isWatched = true;
    });

    const isDisable = await disableFusible(fusible);
    expect(isDisable).toBe(true);

    setTimeout(() => {
        expect(isWatched).toBe(true);
    }, 6000);  // Wait for the watch event, should be > 5007

});
