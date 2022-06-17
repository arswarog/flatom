import { createResolver } from './resolver';
import { createToken, Token } from './token';
import { Resolver } from './resolver.types';

describe('Resolver', () => {
    describe('Token', () => {
        interface IFoo {
            bar: string;
        }

        interface IBar {
            foo: number;
        }

        function getService<T>(token: Token<T>): T {
            return {} as any;
        }

        it('check types', () => {
            const token: Token<IFoo> = createToken<IFoo>('foo');
            // @ts-expect-error check for valid types
            const token2: Token<IFoo> = createToken<IBar>('bar');

            const value1: IFoo = getService(token);
            // @ts-expect-error check for valid types
            const value2: IBar = getService(token);
        });
        it('token unuseful without type', () => {
            const token = createToken('foo');

            const value1 = getService(token);
            // @ts-expect-error check for valid types
            value1.anyField;
            // @ts-expect-error check for valid types
            const value2: IFoo = getService(token);
        });
        it('stringify token', () => {
            const token = createToken('foo');

            expect('' + token).toEqual('Token foo');
            expect(JSON.stringify({ token })).toEqual('{"token":"Token foo"}');
        });
    });
    describe('get', () => {
        const someToken1 = createToken<number>('someValue1');
        const unsetToken = createToken<number>('unsetToken');

        let resolver: Resolver;
        beforeEach(() => {
            resolver = createResolver();
            resolver.set(someToken1, 5);
        });

        it('get value by token', () => {
            const value: number | undefined = resolver.get(someToken1);
            // @ts-expect-error check for valid types
            const value2: string = resolver.get(someToken1);

            expect(value).toEqual(5);
        });

        it('token not found', () => {
            expect(() => resolver.get(unsetToken)).toThrow();
        });

        it('token not found, allowFail = false', () => {
            expect(() => resolver.get(unsetToken, false)).toThrow();
        });

        it('token not found, allowFail = true', () => {
            expect(() => {
                const value = resolver.get(unsetToken, true);
                expect(value).toBeUndefined();
            }).not.toThrow();
        });
    });
});
