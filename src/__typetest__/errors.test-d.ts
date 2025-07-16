import { describe, expect, it } from 'tstyche';

import type { FieldError, GlobalError, Merge } from '../types';
import { useForm } from '../useForm';

describe('errors', () => {
  it('should support optional record fields', () => {
    const {
      formState: { errors },
    } = useForm<{
      test?: string;
      test1?: string;
      attachment: {
        data: string;
        data1: string;
      };
    }>();

    expect(errors).type.toBe<
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
      }
    >();
  });

  it('should support nullable record fields', () => {
    const {
      formState: { errors },
    } = useForm<{
      test?: string;
      test1?: string | null;
      attachment: {
        data: string;
        data1: string;
      } | null;
    }>();

    expect(errors).type.toBe<
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
      }
    >();
  });

  it('should not treat Date, File, FileList or Blob as record fields', () => {
    const {
      formState: { errors },
    } = useForm<{
      date: Date;
      file: File;
      fileList: FileList;
      record: {
        date: Date;
        file: File;
        fileList: FileList;
      };
    }>();

    expect(errors?.date).type.toBe<FieldError | undefined>();
    expect(errors?.file).type.toBe<FieldError | undefined>();
    expect(errors?.fileList).type.toBe<FieldError | undefined>();
    expect(errors?.record?.date).type.toBe<FieldError | undefined>();
    expect(errors?.record?.file).type.toBe<FieldError | undefined>();
    expect(errors?.record?.fileList).type.toBe<FieldError | undefined>();
  });
});
