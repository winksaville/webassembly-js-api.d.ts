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
        name: string;
        kind: string;
    }

    interface ModuleImport extends ModuleExport {
        module: string;
    }

    /**
     * WebAssembly.Module
     */
    class Module {
        constructor(bufferSource: ArrayBuffer | Uint8Array);
        static customSections(module: Module, sectionName: string): ArrayBuffer[];
        static exports(module: Module): ModuleExport[];
        static imports(module: Module): ModuleImport[];
    }

    /**
     * WebAssembly.Instance
     */
    class Instance {
        readonly exports: any;
        constructor(module: Module, importObject?: any);
    }

    /**
     * WebAssembly.Memory
     * Note: A WebAssembly page has a constant size of 65,536 bytes, i.e., 64KiB.
     */
    interface MemoryDescriptor {
        initial: number;
        maximum?: number;
    }

    class Memory {
        readonly buffer: ArrayBuffer;
        constructor(memoryDescriptor: MemoryDescriptor);
        grow(numPages: number): number;
    }

    /**
     * WebAssembly.Table
     */
    interface TableDescriptor extends MemoryDescriptor {
        element: "anyfunc";
    }

    type AnyFunc = (args: any[]) => any;

    class Table {
        readonly length: number;
        constructor(tableDescriptor: TableDescriptor);
        get(index: number): AnyFunc;
        grow(numElements: number): number;
        set(index: number, value: AnyFunc): void;
    }

    /**
     * Errors
     */
    class CompileError extends Error {}

    class LinkError extends Error {}

    class RuntimeError extends Error {}

    function compile(bufferSource: ArrayBuffer | Uint8Array): Promise<Module>;

    interface ResultObject {
        module: Module;
        instance: Instance;
    }

    function instantiate(bufferSource: ArrayBuffer | Uint8Array, importObject?: any): Promise<ResultObject>;
    function instantiate(module: Module, importObject?: any): Promise<Instance>;

    function validate(bufferSource: ArrayBuffer | Uint8Array): boolean;
}
