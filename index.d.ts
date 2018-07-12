// Type definitions for WebAssembly v1 (MVP)
// Project: https://github.com/winksaville/test-webassembly-js-ts
// Definitions by: 01alchemist <https://twitter.com/01alchemist>, Wink Saville <wink@saville.com>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

/**
 * The WebAssembly namespace, see [WebAssembly](https://github.com/webassembly)
 * and [WebAssembly JS API](http://webassembly.org/getting-started/js-api/)
 * for more information.
 */
declare namespace WebAssembly {
    interface ModuleExport {
        /**
         * The external name assigned to the value,
         * e.g. `"exported_func"` or `"imported_func"`
         */
        name: string;
        /** The type of value, e.g `"global"` or `"function"` */
        kind: string;
    }

    interface ModuleImport extends ModuleExport {
        /**
         * The name of the module whose export is being imported
         * (the first string in an `import` expression).
         * E.g. `"imports"`.
         */
        module: string;
    }

    /**
     * An uninstantiated WebAssembly module
     * compiled from its WebAssembly binary code representation
     */
    class Module {
        /**
         * Synchronously compiles a WebAssembly module from
         * an `ArrayBuffer`, `Uint8Array`, or other `TypedArray`
         * @param bufferSource The binary data representing the module
         */
        constructor(bufferSource: BufferSource);
        /**
         * Gets `ArrayBuffer` copies of all custom sections with a certain name
         * @param module The module whose sections to search
         * @param sectionName The name to match to custom sections
         */
        static customSections(module: Module, sectionName: string): ArrayBuffer[];
        /**
         * Gets a list of items specified to be exported.
         * Note that their values are not exported,
         * since a `Module` is uninstantiated.
         * @param module The module whose exports to list
         */
        static exports(module: Module): ModuleExport[];
        /**
         * Gets a list of items specified to be imported.
         * Note that their values are not imported,
         * since a `Module` is uninstantiated.
         * @param module The module whose imports to list
         */
        static imports(module: Module): ModuleImport[];
    }

    /**
     * An instantiated WebAssembly Module.
     * The instance has a memory state
     * and its exported functions can be executed.
     */
    class Instance {
        /**
         * The values exported by the module.
         * An object mapping export name strings to values.
         */
        readonly exports: any;
        /**
         * Instantiates a `Module` with optional imported values
         * @param module The WebAssembly module to instantiate
         * @param importObject The values to import. E.g. `{imports: {imported_func}}` for `(import "imports" "imported_func")`.
         */
        constructor(module: Module, importObject?: any);
    }

    interface MemoryDescriptor {
        /** The number of 64KiB pages to allocate initially */
        initial: number;
        /**
         * The (optional) maximum number of 64KiB pages
         * to allow the memory to grow to.
         * If omitted, memory is bounded only by resource limitations.
         */
        maximum?: number;
    }

    /**
     * A growable `ArrayBuffer` which can be imported or exported
     * by a WebAssembly instance.
     * The memory's size is in units of 64KiB (65,536 or `2 ** 16` bytes) pages.
     */
    class Memory {
        /**
         * The bytes allocated by the memory.
         * Note that the value of `buffer` changes when the memory is grown.
         */
        readonly buffer: ArrayBuffer;
        /**
         * Allocates memory for a WebAssembly module
         * @param memoryDescriptor The initial and maximum sizes of the memory
         */
        constructor(memoryDescriptor: MemoryDescriptor);
        /**
         * Increases the allocated memory
         * @param numPages The (nonnegative) number of pages to add
         * @returns The previous number of allocated pages
         */
        grow(numPages: number): number;
    }

    interface TableDescriptor extends MemoryDescriptor {
        /**
         * The type of elements stored in the table.
         * Currently, only `"anyfunc"` is allowed.
         */
        element: "anyfunc";
    }

    /**
     * An element in a `Table`.
     * `null` if unset.
     * Non-`null` values must be functions exported by an `Instance`.
     */
    type AnyFunc = ((args: any[]) => any) | null;

    /**
     * A 0-indexed list of WebAssembly functions.
     * Resizable, like `Memory`, except in units of elements.
     */
    class Table {
        /**
         * The number of elements in the table.
         * Valid indices are `0` to `length - 1`.
         */
        readonly length: number;
        /**
         * Allocates a table of the specified size.
         * All elements are initially `null`.
         * @param tableDescriptor The initial and maximum sizes of the table
         */
        constructor(tableDescriptor: TableDescriptor);
        /**
         * Gets the element at the specified index in the table
         * @param index The 0-indexed index
         */
        get(index: number): AnyFunc;
        /**
         * Increases the table length
         * @param numElements The (nonnegative) number of elements to add
         * @returns The previous table length
         */
        grow(numElements: number): number;
        /**
         * Sets the element at the specified index in the table
         * @param index The 0-indexed index
         * @param value The value to set
         */
        set(index: number, value: AnyFunc): void;
    }

    /** An `Error` thrown when binary data cannot be compiled into a `Module` */
    class CompileError extends Error {}

    /** An `Error` thrown when instantiating an `Instance` and imports are missing */
    class LinkError extends Error {}

    /** An `Error` thrown when WebAssembly code attempts an invalid operation */
    class RuntimeError extends Error {}

    /** Asynchronously compiles binary code into a `Module` */
    function compile(bufferSource: BufferSource): Promise<Module>;

    /**
     * Asynchronously compiles a source of binary code, e.g. a `fetch`,
     * into a `Module`. Use instead of `compile` when possible.
     */
    function compileStreaming(source: Response | Promise<Response>): Promise<Module>;

    interface ResultObject {
        /** A WebAssembly module */
        module: Module;
        /** An instance of `module` */
        instance: Instance;
    }

    /**
     * Asynchronously compiles binary code into a `Module`
     * and creates an `Instance` of it
     * @param bufferSource The binary data to compile
     * @param importObject Optional values to import into the instance. E.g. `{imports: {imported_func}}` for `(import "imports" "imported_func")`.
     */
    function instantiate(bufferSource: BufferSource, importObject?: any): Promise<ResultObject>;
    /**
     * Asynchronously creates an `Instance` of an existing `Module`
     * @param module The module to instantiate
     * @param importObject Optional values to import into the instance. E.g. `{imports: {imported_func}}` for `(import "imports" "imported_func")`.
     */
    function instantiate(module: Module, importObject?: any): Promise<Instance>;

    /**
     * Asynchronously compiles a source of binary code, e.g. a `fetch`,
     * into a `Module` and an instantiated `Instance`.
     * Use instead of `instantiate` when possible.
     */
    function instantiateStreaming(source: Response | Promise<Response>, importObject?: any): Promise<ResultObject>;

    /**
     * Checks whether binary code specifies a valid WebAssembly module
     * @returns Whether compiling the module would throw a `CompileError`
     */
    function validate(bufferSource: BufferSource): boolean;
}
