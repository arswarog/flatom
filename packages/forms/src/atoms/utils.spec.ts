import { FormControlStatus } from '../abstract-control-state';

import { combineStatuses, getRelativeControlPath, isChildOf } from './utils';

describe('Form atoms utils', () => {
    describe('combineStatuses', () => {
        it('should valid when no items', () => {
            const status = combineStatuses([]);

            expect(status).toBe(FormControlStatus.Valid);
        });
        it('should valid when all items are valid', () => {
            const status = combineStatuses([
                FormControlStatus.Valid,
                FormControlStatus.Valid,
                FormControlStatus.Valid,
                FormControlStatus.Valid,
            ]);

            expect(status).toBe(FormControlStatus.Valid);
        });
        it('should invalid when all items are valid, invalid or pending', () => {
            const status = combineStatuses([
                FormControlStatus.Valid,
                FormControlStatus.Invalid,
                FormControlStatus.Pending,
            ]);

            expect(status).toBe(FormControlStatus.Invalid);
        });
        it('should pending when all items are valid or pending (no invalid)', () => {
            const status = combineStatuses([
                FormControlStatus.Valid,
                FormControlStatus.Pending,
                FormControlStatus.Valid,
            ]);

            expect(status).toBe(FormControlStatus.Pending);
        });
    });
    describe('isChildOf', () => {
        it('direct child', () => {
            expect(isChildOf('test.parent1.child', 'test.parent1')).toBe(true);
        });
        it('direct child of form', () => {
            expect(isChildOf('test.child', 'test')).toBe(true);
        });
        it('child of child', () => {
            expect(isChildOf('test.parent.sub.child', 'test.parent')).toBe(true);
        });
        it('different form', () => {
            expect(isChildOf('test.parent.sub.child', 'test2.parent.sub')).toBe(false);
        });
        it('parent with similar name', () => {
            expect(isChildOf('test.parent2.child', 'test.parent')).toBe(false);
        });
        it('child with similar name', () => {
            expect(isChildOf('test.parent.sub.child', 'test.parent.sub.child2')).toBe(false);
        });
        it('same item', () => {
            expect(isChildOf('test.parent.sub.child', 'test.parent.sub.child')).toBe(false);
        });
    });
    describe('getRelativeControlPath', () => {
        it('direct child', () => {
            expect(getRelativeControlPath('test.parent1', 'test.parent1.child')).toEqual(['child']);
        });
        it('direct child of form', () => {
            expect(getRelativeControlPath('test', 'test.child')).toEqual(['child']);
        });
        it('child of child', () => {
            expect(getRelativeControlPath('test.parent', 'test.parent.sub.child')).toEqual(['sub', 'child']);
        });
        it('same item', () => {
            expect(getRelativeControlPath('test.parent.sub.child', 'test.parent.sub.child')).toEqual([]);
        });
        it('different form', () => {
            expect(() => getRelativeControlPath('test.parent.sub.child', 'test2.parent.sub')).toThrow();
        });
        it('parent with similar name', () => {
            expect(() => getRelativeControlPath('test.parent', 'test.parent2.child')).toThrow();
        });
        it('child with similar name', () => {
            expect(() => getRelativeControlPath('test.parent.sub.child2', 'test.parent.sub.child')).toThrow();
        });
    });
});
