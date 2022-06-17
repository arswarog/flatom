export interface Resolver {
    get<T>(token: Token<T>): T;

    get<T>(token: Token<T>, allowFail: false): T;

    get<T>(token: Token<T>, allowFail: true): T | undefined;

    set<T>(token: Token<T>, value: T): void;

    unset(token: Token<unknown>): void;

    clear(): void;
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
