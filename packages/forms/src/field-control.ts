import { Action, Store } from '@flatom/core';

import { AbstractControl, AbstractControlProps } from './abstract-control';
import { AbstractControlState } from './abstract-control-state';
import { actions } from './atoms/actions';
import { fieldAtomFactory } from './atoms/field-atom';
import { FieldAgent, IFieldAgent } from './field-agent';
import { AbstractControlSchema } from './form-schema';

export class FieldControl<TValue = any> extends AbstractControl<TValue> implements IFieldAgent<TValue> {
    protected cachedFieldAgent?: FieldAgent<TValue>;

    get agent() {
        if (!this.cachedFieldAgent) {
            this.cachedFieldAgent = new FieldAgent<TValue>(this.getState(), this);
        }

        return this.cachedFieldAgent;
    }

    constructor(
        parent: AbstractControl,
        name: string,
        store: Store,
        props: AbstractControlProps,
        schema: AbstractControlSchema<TValue>,
    ) {
        super(parent, name, store, props, schema);

        this._atom = fieldAtomFactory(this.path, this.name, this.defaultValue);

        this.onStateChange = this.onStateChange.bind(this);
        this.getState = this.getState.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.handleBlur = this.handleBlur.bind(this);
    }

    patchValue(value: Partial<TValue>): void {
        throw new Error('Not implements');
    }

    reset(value: TValue | undefined): void {
        this.emit(
            actions.setValue({
                path: this.path,
                value: this.defaultValue || null,
            }),
        );
    }

    handleChange(value: TValue): void {
        this.emit(actions.change({ path: this.path, value }));
    }

    handleFocus(): void {
        this.emit(actions.focus({ path: this.path }));
    }

    handleBlur(): void {
        this.emit(actions.blur({ path: this.path }));
    }

    protected onStateChangeInnerHandler(state: AbstractControlState<TValue>, prev: AbstractControlState<TValue>) {
        this.cachedFieldAgent = undefined;
        super.onStateChangeInnerHandler(state, prev);
    }

    protected emit(action: Action) {
        this.cachedFieldAgent = undefined;
        super.emit(action);
    }
}
