import { ValueProvider, ValueProviders } from './provider.types';

export interface Resolver {
    resolve<T>(provider: ValueProvider<T>): T;

    resolveMany<T1>(providers: [
        ValueProvider<T1>
    ]): [T1];

    resolveMany<T1, T2>(providers: [
        ValueProvider<T1>,
        ValueProvider<T2>
    ]): [T1, T2];

    resolveMany<T1, T2, T3>(providers: [
        ValueProvider<T1>,
        ValueProvider<T2>,
        ValueProvider<T3>
    ]): [T1, T2, T3];

    resolveMany(providers: ValueProvider<any>[]): any[];

    set?(provider: any, value: any): void; // todo

    unset?(provider: any): void; // todo

    reset?(): void; // todo
}
