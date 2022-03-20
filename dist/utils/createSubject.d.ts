import { Noop } from '../types';
export declare type Observer<T> = {
    next: (value: T) => void;
};
export declare type Subscription = {
    unsubscribe: Noop;
};
export declare type Subject<T> = {
    readonly observers: Observer<T>[];
    subscribe: (value: Observer<T>) => Subscription;
    unsubscribe: Noop;
} & Observer<T>;
export default function createSubject<T>(): Subject<T>;
//# sourceMappingURL=createSubject.d.ts.map