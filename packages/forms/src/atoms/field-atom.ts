import { Atom, declareAtom } from '@flatom/core';
import * as sprout from 'sprout-data';

import { AbstractControlState, FormControlStatus } from '../abstract-control-state';

import { actions } from './actions';
import { getRelativeControlPath, isChildOf } from './utils';

export function fieldAtomFactory<TValue = any>(
    path: string,
    name: string,
    initialValue: TValue,
): Atom<AbstractControlState<TValue>> {
    return declareAtom<AbstractControlState<TValue>>('fieldControl:' + path, {
        path,
        name,
        value: initialValue,
        status: FormControlStatus.Pending,
        disabled: false,
        focused: false,
        dirty: false,
        touched: false,
        errors: null,
        firstErrorMessage: '',
        validators: [],
        errorMessages: {},
    })((on) => [
        on(actions.setValue, (state, { path, value }) => {
            if (state.path !== path && !isChildOf(state.path, path)) {
                return state;
            }

            let controlValue = value;

            if (state.path !== path) {
                controlValue = sprout.get(value, getRelativeControlPath(path, state.path), null);
            }

            if (state.value === controlValue) {
                return state;
            }

            state = sprout.assoc(state, ['status'], FormControlStatus.Pending);
            state = sprout.assoc(state, ['errors'], null);

            return sprout.assoc(state, ['value'], controlValue);
        }),
        on(actions.change, (state, { path, value }) => {
            if (state.path !== path) {
                return state;
            }

            if (state.value === value) {
                return state;
            }

            return {
                ...state,
                value,
                dirty: true,
                status: FormControlStatus.Pending,
                errors: null,
                firstErrorMessage: '',
            };
        }),
        on(actions.valid, (state, { path }) => {
            if (state.path !== path) {
                return state;
            }

            state = sprout.assoc(state, ['status'], FormControlStatus.Valid);
            state = sprout.assoc(state, ['errors'], null);
            state = sprout.assoc(state, ['firstErrorMessage'], '');

            return state;
        }),
        on(actions.pending, (state, { path }) => {
            if (state.path !== path) {
                return state;
            }

            state = sprout.assoc(state, ['status'], FormControlStatus.Pending);
            state = sprout.assoc(state, ['errors'], null);
            state = sprout.assoc(state, ['firstErrorMessage'], '');

            return state;
        }),
        on(actions.invalid, (state, { path, errors, firstErrorMessage }) => {
            if (state.path !== path) {
                return state;
            }

            state = sprout.assoc(state, ['status'], FormControlStatus.Invalid);
            state = sprout.assoc(state, ['errors'], errors);
            state = sprout.assoc(state, ['firstErrorMessage'], firstErrorMessage);

            return state;
        }),
        on(actions.patchState, (state, value) => {
            if (state.path !== value.path) {
                return state;
            }

            return sprout.merge(state, value);
        }),
        on(actions.enable, (state, value) => {
            if (state.path !== value.path) {
                return state;
            }

            return sprout.assoc(state, ['disabled'], false);
        }),
        on(actions.disable, (state, value) => {
            if (state.path !== value.path) {
                return state;
            }

            return sprout.assoc(state, ['disabled'], true);
        }),
        on(actions.focus, (state, value) => {
            return sprout.assoc(state, ['focused'], state.path === value.path);
        }),
        on(actions.blur, (state, value) => {
            if (state.path !== value.path) {
                return state;
            }

            state = sprout.assoc(state, ['focused'], false);
            state = sprout.assoc(state, ['touched'], true);

            return state;
        }),
    ]);
}
