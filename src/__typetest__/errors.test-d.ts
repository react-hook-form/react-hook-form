import { expectType } from 'tsd';

import { FieldError, FieldErrors, Merge } from '../types';

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
    expectType<{
      test?: FieldError;
      test1?: FieldError;
      attachment?: Merge<
        FieldError,
        {
          data?: FieldError;
          data1?: FieldError;
        }
      >;
    }>(actual);
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
    expectType<{
      test?: FieldError;
      test1?: FieldError;
      attachment?: Merge<
        FieldError,
        {
          data?: FieldError;
          data1?: FieldError;
        }
      >;
    }>(actual);
  }

  /** it should not treat Date, File, FileList or Blob as record fields */
  {
    const actual = _ as FieldErrors<{
      date: Date;
      file: File;
      fileList: FileList;
      record: {
        date: Date;
        file: File;
        fileList: FileList;
      };
    }>;
    expectType<{
      date?: FieldError;
      file?: FieldError;
      fileList?: FieldError;
      record?: {
        date?: FieldError;
        file?: FieldError;
        fileList?: FieldError;
      };
    }>(actual);
  }
}
