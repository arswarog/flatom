import { Unsubscribe } from '@flatom/core';

import { AbstractControlState } from './abstract-control-state';
import { ReadonlyControl } from './readonly-control';

export interface IFieldAgent<TValue = any> {
    onStateChange(cb: (control: ReadonlyControl<TValue>) => void): Unsubscribe;

    handleChange(value: TValue): void;

    handleFocus(): void;

    handleBlur(): void;

    getState(): AbstractControlState<TValue>;
}

export class FieldAgent<TValue = any> extends ReadonlyControl<TValue> implements IFieldAgent<TValue> {
    public onStateChange: (cb: (control: ReadonlyControl<TValue>) => void) => Unsubscribe;

    public handleBlur: () => void;

    public handleChange: (value: TValue) => void;

    public handleFocus: () => void;

    public getState: () => AbstractControlState<TValue>;

    constructor(state: AbstractControlState<TValue>, agentProps: IFieldAgent<TValue>) {
        super(state);

        this.onStateChange = agentProps.onStateChange;
        this.handleBlur = agentProps.handleBlur;
        this.handleChange = agentProps.handleChange;
        this.handleFocus = agentProps.handleFocus;
        this.getState = agentProps.getState;
    }
}
