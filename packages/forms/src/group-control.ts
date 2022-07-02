import { Store } from '@flatom/core';

import { AbstractControl, AbstractControlProps } from './abstract-control';
import { GroupControlState } from './abstract-control-state';
import { actions } from './atoms/actions';
import { groupAtomFactory } from './atoms/group-atom';
import { FieldControl } from './field-control';
import { AbstractControlSchema, GroupControlSchema } from './form-schema';

export class GroupControl<TValue = any> extends AbstractControl<TValue> {
    constructor(
        parent: AbstractControl | null,
        name: string,
        store: Store,
        props: AbstractControlProps,
        schema: GroupControlSchema<TValue>,
    ) {
        const defaultValue = schema.defaultValue ?? undefined;

        super(parent, name, store, props, { ...schema, defaultValue });

        this.buildControls(schema, props);

        if (schema.nullable) {
            this.defaultValue = schema.defaultValue === undefined ? null : schema.defaultValue;
        } else {
            const initialValue = this.recalculateValue();

            this.defaultValue = schema.defaultValue === undefined ? initialValue : schema.defaultValue;
        }

        this._state.value = this.defaultValue;

        this._atom = groupAtomFactory(
            this.path,
            this.name,
            this.defaultValue,
            Array.from(this.controls.values()).map((item) => item.atom),
        );
    }

    _init() {
        this.controls.forEach((child) => child._init());

        super._init();
    }

    _destroy() {
        super._destroy();
        this.controls.forEach((child) => child._destroy());
    }

    async validate(): Promise<boolean> {
        const errors = this.validationControl.syncValidate(this);

        if (errors) {
            const firstErrorMessage = this.validationControl.getFirstError(errors);

            this.emit(
                actions.invalid({
                    path: this.path,
                    errors,
                    firstErrorMessage,
                }),
            );

            return false;
        }

        const badChildren: string[] = [];

        this.controls.forEach((control) => control.invalid && badChildren.push(control.name));

        if (badChildren.length) {
            const childrenErrors = {
                children: { list: badChildren },
            };
            const firstErrorMessage = this.validationControl.getFirstError(childrenErrors);

            this.emit(
                actions.invalid({
                    path: this.path,
                    errors: childrenErrors,
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
                const firstErrorMessage = this.validationControl.getFirstError(errors);

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

    has(name: string): boolean {
        return this.controls.has(name);
    }

    get(name: string): AbstractControl {
        if (!this.has(name)) {
            throw new Error(`Control "${name}" does not exists in GroupControl "${this.path}"`);
        }

        return this.controls.get(name)!;
    }

    public getState(): GroupControlState<TValue> {
        return this._state as GroupControlState<TValue>;
    }

    private recalculateValue(): TValue {
        const value: Record<string, any> = {};

        this.controls.forEach((control, key) => {
            value[key] = control.value;
        });

        return value as TValue;
    }

    private buildControls(schema: GroupControlSchema<TValue>, props: AbstractControlProps) {
        this.controls = new Map<string, AbstractControl>();

        Object.entries(schema.controls as Record<string, AbstractControlSchema>).forEach(([key, field]) => {
            if ('controls' in field) {
                if (Array.isArray(field['controls'])) {
                    throw new Error('array is not supported');
                } else {
                    this.controls.set(key, new GroupControl(this, key, this.store, props, field as GroupControlSchema));
                }
            } else {
                this.controls.set(key, new FieldControl(this, key, this.store, props, field));
            }
        });
    }
}
