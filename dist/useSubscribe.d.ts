import { Subject } from './utils/createSubject';
declare type Props<T> = {
    disabled?: boolean;
    subject: Subject<T>;
    callback: (value: T) => void;
};
export declare function useSubscribe<T>(props: Props<T>): void;
export {};
//# sourceMappingURL=useSubscribe.d.ts.map