export type VoidFunction = () => void;

interface File extends Blob {
  readonly lastModified: number;
  readonly name: string;
}

export interface FileList {
  [Symbol.iterator](): IterableIterator<File>;
}

export type Node = any;

export type MutationObserverInit = any;

export type HTMLOptionsCollection = any;
