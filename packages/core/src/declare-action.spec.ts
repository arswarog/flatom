import { declareAction } from './declare-action';
import { Action, PayloadAction } from './action.types';

describe('declareAction', () => {
    describe('declareAction', () => {
        it('no params', () => {
            const ac = declareAction('action');

            const action: Action = ac();
            expect(action).toEqual({
                type: 'action',
            });
        });
        it('no params - types', () => {
            const ac = declareAction('action');

            const action: Action = ac();
            //@ts-expect-error
            const action2: Action<number> = ac();
            //@ts-expect-error
            const action3: Action<number> = ac(5);
            //@ts-expect-error
            const action4: Action = ac(5);
        });
        it('string param', () => {
            const ac = declareAction<string>('action');

            const action: Action = ac('5');
            expect(action).toEqual({
                type: 'action',
                payload: '5',
            });
        });
        it('string param - types', () => {
            const ac = declareAction<string>('action');

            const action: PayloadAction<string> = ac('');
            //@ts-expect-error
            const action2: PayloadAction<number> = ac();
            //@ts-expect-error
            const action3: PayloadAction<number> = ac(5);
            //@ts-expect-error
            const action4: PayloadAction<string, boolean> = ac('5');
        });
    });
});
