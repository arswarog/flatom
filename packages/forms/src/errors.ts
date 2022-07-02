export class SchemaError extends Error {
    constructor(path: string, message: string) {
        super(`Schema error: ${message}\n  in ${path}`);
    }
}
