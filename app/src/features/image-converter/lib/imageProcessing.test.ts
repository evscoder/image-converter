import { mapWithConcurrency } from './imageProcessing';

test('concurrent mapping limits active tasks and preserves input order', async () => {
    let active = 0;
    let maximumActive = 0;

    const results = await mapWithConcurrency([1, 2, 3, 4, 5], 2, async value => {
        active++;
        maximumActive = Math.max(maximumActive, active);
        await new Promise(resolve => window.setTimeout(resolve, 0));
        active--;
        return value * 10;
    });

    expect(maximumActive).toBe(2);
    expect(results).toEqual([10, 20, 30, 40, 50]);
});
