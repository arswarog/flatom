import { StateProvider, UnProv, declareAction } from '../src';

describe('Flatom', () => {
    test('base', () => {
        const nn: StateProvider<number> = {
            getState(): number {return 5;},
        };

        const ss: StateProvider<string> = {
            getState(): string {return '5';},
        };

        type NN = UnProv<typeof nn>;
        type SS = UnProv<typeof ss>;

        const acx = declareAction<{ b: boolean }>('x');

        const acx1 = declareAction('x2', (payload: { x: boolean }) => {
            return {
                count: !payload.x,
            };
        });

// const acx1e = declareAction('x2', (payload: { x: boolean }, s, n) => {
//     return {
//         count: s.length + n,
//     };
// });

        const acx2 = declareAction('x2', [ss, nn], (payload: { x: boolean }, s, n) => {
            return {
                count: s.length + n,
            };
        });

// const acx2e = declareAction('x2', [ss, nn], (payload: { x: boolean }, s, n) => {
//     return s.length + n.length;
// });

        const ax = acx();
        const ax1 = acx1({x: true});
// const ax2 = acx2({x: true});
    });
});
