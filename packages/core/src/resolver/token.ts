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
