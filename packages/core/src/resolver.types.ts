export interface Resolver {
    get<T>(token: Token<T>): T;

    get<T>(token: Token<T>, allowFail: false): T;

    get<T>(token: Token<T>, allowFail: true): T | undefined;

    getMany<T1>(tokens: [Token<T1>]): [T1];

    getMany<T1, T2>(tokens: [Token<T1>, Token<T2>]): [T1, T2];

    getMany<T1, T2, T3>(tokens: [Token<T1>, Token<T2>, Token<T3>]): [T1, T2, T3];

    getMany(tokens: Token<unknown>[]): unknown[];

    set(token: any, value: any): void; // todo

    unset(provider: any): void; // todo

    clear(): void; // todo
}

export class Token<T> {
    constructor(public readonly name: string) {
        this.typeHolder = name as any;
    }

    toString(): string {
        return `Token ${this.name}`;
    }

    toJSON() {
        return this.toString();
    }

    private typeHolder: T;
}

export function createToken<T = void>(name: string): Token<T> {
    return new Token<T>(name);
}
