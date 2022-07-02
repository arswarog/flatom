import { FormControlStatus } from '../abstract-control-state';

export function combineStatuses(statuses: FormControlStatus[]): FormControlStatus {
    let status = FormControlStatus.Valid;

    for (let i = 0; i < statuses.length; i++) {
        if (statuses[i] === FormControlStatus.Invalid) {
            return FormControlStatus.Invalid;
        }

        if (statuses[i] === FormControlStatus.Pending) {
            status = FormControlStatus.Pending;
        }
    }

    return status;
}

export function isChildOf(control: string, target: string): boolean {
    return control.startsWith(target + '.');
}

export function getRelativeControlPath(control: string, target: string): string[] {
    if (control === target) {
        return [];
    }

    if (!isChildOf(target, control)) {
        throw new Error(`Control "${target}" is not child of "${control}"`);
    }

    const controlPath = control.split('.');
    const targetPath = target.split('.');

    return targetPath.slice(controlPath.length);
}
