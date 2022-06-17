import { Token } from './token';

export interface Resolver {
    get<T>(token: Token<T>): T;

    get<T>(token: Token<T>, allowFail: false): T;

    get<T>(token: Token<T>, allowFail: true): T | undefined;

    set<T>(token: Token<T>, value: T): void;

    unset(token: Token<unknown>): void;

    clear(): void;
}
