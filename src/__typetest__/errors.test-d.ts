import type {
  FieldError,
  FieldErrors,
  FieldPathError,
  GlobalError,
  Merge,
} from '../types';

import type { Equal, Expect } from './__fixtures__';
import { _ } from './__fixtures__';

/** {@link FieldErrors} */ {
  /** it should support optional record fields */
  {
    const actual = _ as FieldErrors<{
      test?: string;
      test1?: string;
      attachment: {
        data: string;
        data1: string;
      };
    }>;
    type _t = Expect<
      Equal<
        typeof actual,
        {
          test?: FieldError;
          test1?: FieldError;
          attachment?: Merge<
            FieldError,
            {
              data?: FieldError;
              data1?: FieldError;
            }
          >;
        } & {
          root?: Record<string, GlobalError> & GlobalError;
          form?: GlobalError;
        }
      >
    >;
  }

  /** it should support nullable record fields */
  {
    const actual = _ as FieldErrors<{
      test?: string;
      test1?: string | null;
      attachment: {
        data: string;
        data1: string;
      } | null;
    }>;
    type _t = Expect<
      Equal<
        typeof actual,
        {
          test?: FieldError;
          test1?: FieldError;
          attachment?: Merge<
            FieldError,
            {
              data?: FieldError;
              data1?: FieldError;
            }
          >;
        } & {
          root?: Record<string, GlobalError> & GlobalError;
          form?: GlobalError;
        }
      >
    >;
  }

  /** it should not treat Date, File, FileList or Blob as record fields */
  {
    const actual = _ as FieldErrors<{
      date: Date;
      file: File;
      fileList: FileList;
      blob: Blob;
      record: {
        date: Date;
        file: File;
        fileList: FileList;
        blob: Blob;
      };
    }>;
    const recordDate = actual.record?.date;
    const recordFile = actual.record?.file;
    const recordFileList = actual.record?.fileList;
    const recordBlob = actual.record?.blob;
    type _t1 = Expect<Equal<typeof actual.date, FieldError | undefined>>;
    type _t2 = Expect<Equal<typeof actual.file, FieldError | undefined>>;
    type _t3 = Expect<Equal<typeof actual.fileList, FieldError | undefined>>;
    type _t4 = Expect<Equal<typeof recordDate, FieldError | undefined>>;
    type _t5 = Expect<Equal<typeof recordFile, FieldError | undefined>>;
    type _t6 = Expect<Equal<typeof recordFileList, FieldError | undefined>>;
    type _t7 = Expect<Equal<typeof actual.blob, FieldError | undefined>>;
    type _t8 = Expect<Equal<typeof recordBlob, FieldError | undefined>>;
  }

  /** it should handle field name conflicts with FieldError properties correctly */
  {
    const actual = _ as FieldErrors<{
      frequencyInput: {
        type: 'monthly' | 'yearly';
      };
    }>;

    const fiType = actual.frequencyInput?.type;
    const fiTypeMessage = actual.frequencyInput?.type?.message;
    type _t1 = Expect<Equal<typeof fiType, FieldError | undefined>>;
    type _t2 = Expect<Equal<typeof fiTypeMessage, string | undefined>>;
  }
}

/** {@link FieldPathError} */ {
  type FormValues = {
    text: string;
    optional?: string;
    date: Date;
    file: File;
    fileList: FileList;
    blob: Blob;
    nested?: { name: string; root: { child: string } } | null;
    list: Array<{ a: string }>;
    tuple: [string, { count: number }];
    anything: any;
    nothing: null;
    mixed: string | { nested: string };
    variants: { a: string } | { b: string };
    conflict: {
      type: 'monthly' | 'yearly';
      message: string;
    };
  };

  /** it should resolve leaf fields to FieldError */
  {
    type _t1 = Expect<Equal<FieldPathError<FormValues, 'text'>, FieldError>>;
    type _t2 = Expect<
      Equal<FieldPathError<FormValues, 'optional'>, FieldError>
    >;
    type _t3 = Expect<Equal<FieldPathError<FormValues, 'date'>, FieldError>>;
    type _t4 = Expect<Equal<FieldPathError<FormValues, 'file'>, FieldError>>;
    type _t5 = Expect<
      Equal<FieldPathError<FormValues, 'fileList'>, FieldError>
    >;
    type _t6 = Expect<Equal<FieldPathError<FormValues, 'blob'>, FieldError>>;
  }

  /** it should resolve parent, array and tuple paths as stored in FieldErrors */
  {
    type _t1 = Expect<
      Equal<
        FieldPathError<FormValues, 'nested'>,
        NonNullable<FieldErrors<FormValues>['nested']>
      >
    >;
    type _t2 = Expect<
      Equal<
        FieldPathError<FormValues, 'list'>,
        NonNullable<FieldErrors<FormValues>['list']>
      >
    >;
    type _t3 = Expect<
      Equal<
        FieldPathError<FormValues, 'tuple'>,
        NonNullable<FieldErrors<FormValues>['tuple']>
      >
    >;
    type _t4 = Expect<
      Equal<FieldPathError<FormValues, 'nested.name'>, FieldError>
    >;
    type _t5 = Expect<
      Equal<FieldPathError<FormValues, 'list.0.a'>, FieldError>
    >;
    type _t6 = Expect<
      Equal<FieldPathError<FormValues, 'tuple.1.count'>, FieldError>
    >;
  }

  /** it should preserve fallback and union behavior */
  {
    type _t1 = Expect<
      Equal<FieldPathError<FormValues, 'anything'>, FieldError>
    >;
    type _t2 = Expect<Equal<FieldPathError<FormValues, 'nothing'>, FieldError>>;
    type _t3 = Expect<
      Equal<
        FieldPathError<FormValues, 'mixed'>,
        NonNullable<FieldErrors<FormValues>['mixed']>
      >
    >;
    type _t4 = Expect<
      Equal<
        FieldPathError<FormValues, 'variants'>,
        NonNullable<FieldErrors<FormValues>['variants']>
      >
    >;
  }

  /** it should distribute over field path unions */
  {
    type _t = Expect<
      Equal<
        FieldPathError<FormValues, 'text' | 'nested'>,
        FieldError | NonNullable<FieldErrors<FormValues>['nested']>
      >
    >;
  }

  /** it should support self-referencing field values */
  {
    type Node = {
      value: string;
      children: Node[];
    };

    type FormValues = { tree: Node };
    const error = _ as FieldPathError<FormValues, 'tree'>;
    const message = error.children?.[0]?.value?.message;

    type _t = Expect<Equal<typeof message, string | undefined>>;
  }

  /** it should preserve FieldError property-name conflicts */
  {
    type ConflictError = FieldPathError<FormValues, 'conflict'>;
    type _t1 = Expect<Equal<ConflictError['type'], FieldError | undefined>>;
    type _t2 = Expect<
      Equal<NonNullable<ConflictError['type']>['message'], string | undefined>
    >;
    type _t3 = Expect<Equal<ConflictError['message'], FieldError | undefined>>;
  }

  /** it should preserve FieldErrorsImpl's nested root mapping */
  {
    type _t1 = Expect<
      Equal<FieldPathError<FormValues, 'nested.root'>, GlobalError>
    >;
    type _t2 = Expect<
      Equal<
        FieldPathError<FormValues, 'nested'>['root'],
        GlobalError | undefined
      >
    >;
  }

  /** it should resolve direct paths hidden by the nested root mapping */
  {
    // Parent access is typed as GlobalError, but runtime path lookup can store
    // and return a FieldError at this path.
    type _t = Expect<
      Equal<FieldPathError<FormValues, 'nested.root.child'>, FieldError>
    >;
  }

  /** it should reject unknown field paths */
  {
    // @ts-expect-error unknown field path
    type _t = FieldPathError<FormValues, 'missing'>;
  }
}
