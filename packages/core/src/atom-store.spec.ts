import { declareAtom } from './declare-atom';
import { AtomStore } from './atom-store';

describe('AtomStore', function () {
    describe('AtomStore', function () {
        const atomA = declareAtom('A')({});
        const atomB = declareAtom('B')({});

        it('get AtomToken', () => {
            const atomStore = new AtomStore();

            const a = atomStore.get(atomA);
            const b = atomStore.get(atomB);
            const b1 = atomStore.get(atomB, '1');
            const b1x = atomStore.get(atomB, '1');
            const b2 = atomStore.get(atomB, '2');
            const b2x = atomStore.get(atomB, '2');

            expect(a).not.toBe(b);
            expect(a).not.toBe(b1);
            expect(a).not.toBe(b2);
            expect(b).not.toBe(b1);
            expect(b).not.toBe(b2);
            expect(b1).not.toBe(b2);

            expect(b1).toBe(b1x);
            expect(b2).toBe(b2x);
        });

        it('AtomToken to string', () => {
            const atomStore = new AtomStore();

            const a = atomStore.get(atomA);
            const b = atomStore.get(atomB);
            const b1 = atomStore.get(atomB, '1');
            const b1x = atomStore.get(atomB, '1');
            const b2 = atomStore.get(atomB, '2');
            const b2x = atomStore.get(atomB, '2');

            expect(String(a)).toBe('A');
            expect(String(b)).toBe('B');
            expect(String(b1)).toBe('B⊃1');
            expect(String(b1x)).toBe('B⊃1');
            expect(String(b2)).toBe('B⊃2');
            expect(String(b2x)).toBe('B⊃2');
        });
    });

    describe('special token', () => {
        it('toString', () => {
            const atomStore = new AtomStore();

            expect(String(atomStore.special)).toBe('∅');
        });
    });
});
