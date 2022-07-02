import { AbstractControlState } from '../abstract-control-state';
import { ValidationErrors } from '../validation';
import { declareActions } from '@flatom/core';

export const actions = declareActions('flatom-form', ({ action }) => ({
    setValue: action<{ path: string; value: any }>(),
    change: action<{ path: string; value: any }>(),

    pending: action<{ path: string }>(),
    invalid: action<{ path: string; errors: ValidationErrors; firstErrorMessage: string }>(),
    valid: action<{ path: string }>(),

    enable: action<{ path: string }>(),
    disable: action<{ path: string }>(),

    focus: action<{ path: string }>(),
    blur: action<{ path: string }>(),

    patchState: action<Partial<AbstractControlState> & { path: string }>(),
}));
