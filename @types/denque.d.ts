declare module 'denque' {
  export default class<T> {
    constructor(items?: ReadonlyArray<T>);
    readonly length: number;
    push(...items: T[]): number;
    unshift(...items: T[]): number;
    pop(): T | undefined;
    shift(): T | undefined;
    toArray(): T[];
    peekBack(): T | undefined;
    peekFront(): T | undefined;
    peekAt(index: number): T | undefined;
    remove(index: number, count: number): T[] | undefined;
    removeOne(index: number): T | undefined;
    splice(index: number, count: number, ...items: T[]): T[] | undefined;
    isEmpty(): boolean;
    clear(): void;
  }
}
