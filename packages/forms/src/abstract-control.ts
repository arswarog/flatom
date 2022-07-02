import { Action, Atom, declareAtom, Store, Subscription, Unsubscribe } from '@flatom/core';

import { setMicrotask } from './utils/tests';

import { AbstractControlState, FormControlStatus } from './abstract-control-state';
import { actions } from './atoms/actions';
import { SchemaError } from './errors';
import { AbstractControlSchema, UpdateStrategy } from './form-schema';
import { ReadonlyControl } from './readonly-control';
import { ValidationControl, ValidationControlProps, ValidationErrors, ValidatorsControl } from './validation';

export type AbstractControlProps = ValidationControlProps;

export interface ControlStateListener<TValue = any> {
    (child: ReadonlyControl<TValue>): void;
}

export abstract class AbstractControl<TValue = any> extends ReadonlyControl<TValue> {
    public nullable = false;
    public defaultValue: TValue | null = null;
    public updateOn: UpdateStrategy = 'change';
    public validators: ValidatorsControl;

    public controls = new Map<string, AbstractControl>();

    public get atom() {
        return this._atom;
    }

    public get readOnlyControl() {
        if (!this._readOnlyControl) {
            this._readOnlyControl = new ReadonlyControl<TValue>(this.getState());
        }

        return this._readOnlyControl;
    }

    protected _readOnlyControl?: ReadonlyControl<TValue>;
    protected _atom: Atom<any> = declareAtom('tmp')({});

    protected root: AbstractControl;
    protected parent: AbstractControl | null;
    protected validationControl: ValidationControl;

    protected unsubscribe?: Subscription;
    protected stateListeners = new Set<ControlStateListener<TValue>>();

    constructor(
        parent: AbstractControl | null,
        name: string,
        public readonly store: Store,
        props: AbstractControlProps,
        schema: AbstractControlSchema<TValue>,
    ) {
        super(parent ? parent.path + '.' + name : name, name || '');

        if (!schema.nullable && schema.defaultValue === undefined) {
            throw new SchemaError('', 'nullable or defaultValue must be present');
        }

        this.parent = parent;
        // @ts-ignore пока так
        this.root = parent?.root;
        this.validationControl = new ValidationControl(props);
        this.validators = this.validationControl;

        this.updateOn = schema.updateOn || this.updateOn;
        this.nullable = !!schema.nullable;
        this.defaultValue = schema.defaultValue !== undefined ? schema.defaultValue : null;
        this.validators.setValidators(schema.validators || []);

        this._state.value = this.defaultValue;
    }

    _destroy() {
        this.unsubscribe && this.unsubscribe();
    }

    onStateChange(cb: (control: ReadonlyControl<TValue>) => void): Unsubscribe {
        return this.store.subscribe(this._atom, () => {
            this._readOnlyControl = undefined;

            return cb(this.readOnlyControl);
        });
    }

    async validate(): Promise<boolean> {
        const errors = this.validationControl.syncValidate(this);

        if (errors) {
            const firstErrorMessage = this.validationControl.getFirstError(errors, this.getState().errorMessages);

            this.emit(
                actions.invalid({
                    path: this.path,
                    errors,
                    firstErrorMessage,
                }),
            );

            return false;
        }

        this.emit(
            actions.pending({
                path: this.path,
            }),
        );

        return this.validationControl.asyncValidate(this).then((errors) => {
            if (errors) {
                const firstErrorMessage = this.validationControl.getFirstError(errors, this.getState().errorMessages);

                this.emit(
                    actions.invalid({
                        path: this.path,
                        errors,
                        firstErrorMessage,
                    }),
                );

                return false;
            } else {
                this.emit(
                    actions.valid({
                        path: this.path,
                    }),
                );

                return true;
            }
        });
    }

    markAsTouched(): void {
        this.emit(
            actions.patchState({
                path: this.path,
                touched: true,
            }),
        );
    }

    markAsUntouched(): void {
        this.emit(
            actions.patchState({
                path: this.path,
                touched: false,
            }),
        );
    }

    markAsDirty(): void {
        this.emit(
            actions.patchState({
                path: this.path,
                dirty: true,
            }),
        );
    }

    markAsPristine(): void {
        this.emit(
            actions.patchState({
                path: this.path,
                dirty: false,
            }),
        );
    }

    markAsPending(): void {
        this.emit(
            actions.patchState({
                path: this.path,
                status: FormControlStatus.Pending,
            }),
        );
    }

    disable(): void {
        this.emit(
            actions.disable({
                path: this.path,
            }),
        );
    }

    enable(): void {
        this.emit(
            actions.enable({
                path: this.path,
            }),
        );
    }

    setValue(value: TValue | null, options?: any): void {
        this.emit(
            actions.setValue({
                path: this.path,
                value,
            }),
        );
    }

    abstract patchValue(value: Partial<TValue>): void;

    abstract reset(value?: TValue): void;

    setErrors(errors: ValidationErrors): void {
        throw new Error('Not implements');
    }

    has<P extends string>(name: P): boolean {
        throw new Error(`Can not get any control on no GroupControl "${this.path}"`);
    }

    get<P extends string>(name: P): AbstractControl {
        throw new Error(`Can not get control "${name}" from no GroupControl "${this.path}"`);
    }

    getError(errorCode: string, path?: string | (string | number)[]): any {
        if (this._state.errors && errorCode in this._state.errors) {
            return this._state.errors[errorCode];
        } else {
            return null;
        }
    }

    hasError(errorCode: string, path?: string | (string | number)[]): boolean {
        if (!this._state.errors) {
            return false;
        }

        return errorCode in this._state.errors;
    }

    _init() {
        this.unsubscribe = this.store.subscribe(this.atom, this.onStateChangeInnerHandler.bind(this));

        this.validate();
    }

    protected onStateChangeInnerHandler(state: AbstractControlState<TValue>, prev: AbstractControlState<TValue>) {
        this._state = state;

        if (state.value !== prev.value) {
            setMicrotask(() => this.validate());
        }
    }

    protected mergeStateSilent<T extends AbstractControlState>(updates: Partial<T>) {
        this._state = {
            ...this._state,
            ...updates,
        };
    }

    protected emit(action: Action) {
        this._readOnlyControl = undefined;
        this.store.dispatch(action);
    }
}
