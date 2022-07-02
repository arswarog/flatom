import { AbstractControlState, FormControlStatus } from './abstract-control-state';
import { ValidationErrors } from './validation';

export class ReadonlyControl<TValue = any> {
    public readonly path: string;
    public readonly name: string;

    protected _state: AbstractControlState<TValue> = {
        path: '',
        name: '',
        value: null,
        status: FormControlStatus.Pending,
        disabled: false,
        focused: false,
        dirty: false,
        touched: false,
        errors: null,
        firstErrorMessage: '',
        validators: [],
        errorMessages: {},
    };

    constructor(path: string, name: string);
    constructor(state: AbstractControlState<TValue>);
    constructor(state: string | AbstractControlState<TValue>, name?: string) {
        if (typeof state === 'string') {
            this.path = state;
            this.name = name!;
        } else {
            this.path = state.path;
            this.name = state.name;
            this._state = state;
        }
    }

    get value() {
        return this.getState().value;
    }

    get status() {
        return this.getState().status;
    }

    get valid() {
        return this.getState().status === 'VALID';
    }

    get invalid() {
        return this.getState().status === 'INVALID';
    }

    get pending() {
        return this.getState().status === 'PENDING';
    }

    get disabled() {
        return this.getState().disabled;
    }

    get enabled() {
        return !this.getState().disabled;
    }

    get pristine() {
        return !this.getState().dirty;
    }

    get dirty() {
        return this.getState().dirty;
    }

    get focused() {
        return this.getState().focused;
    }

    get touched() {
        return this.getState().touched;
    }

    get untouched() {
        return !this.getState().touched;
    }

    get errors(): Readonly<ValidationErrors | null> {
        return this.getState().errors;
    }

    get firstErrorMessage(): string {
        return this.getState().firstErrorMessage;
    }

    public getState(): AbstractControlState<TValue> {
        return this._state;
    }
}
