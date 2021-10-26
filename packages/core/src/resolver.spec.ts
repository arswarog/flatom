import { createToken, Resolver, Token } from './resolver.types';
import { createResolver } from './resolver';

describe('Resolver', () => {
    describe('Token', () => {
        interface IFoo {
            bar: string;
        }

        interface IBar {
            foo: number;
        }

        function resolve<T>(token: Token<T>): T {
            return {} as any;
        }

        it('check types', () => {
            const token: Token<IFoo> = createToken<IFoo>('foo');
            // @ts-expect-error
            const token2: Token<IFoo> = createToken<IBar>('bar');

            const value1: IFoo = resolve(token);
            // @ts-expect-error
            const value2: IBar = resolve(token);
        });
        it('token unuseful without type', () => {
            const token = createToken('foo');

            const value1 = resolve(token);
            // @ts-expect-error
            value1.anyField;
            // @ts-expect-error
            const value2: IFoo = resolve(token);
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
            // @ts-expect-error
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
