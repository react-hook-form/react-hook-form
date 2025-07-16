import { expect, it } from 'tstyche';

import { useFormContext } from '../useFormContext';

it('should correctly infer the output type from useFormContext', () => {
  type Input = {
    test: string;
  };

  /* eslint-disable react-hooks/rules-of-hooks */
  const { handleSubmit } = useFormContext<Input>();

  handleSubmit((data) => {
    expect(data).type.toBe<Input>();
  });
});

it('should correctly infer the output type from useFormContext with different output type', () => {
  type Input = {
    test: string;
  };

  type Output = {
    test: number;
  };

  /* eslint-disable react-hooks/rules-of-hooks */
  const { handleSubmit } = useFormContext<Input, unknown, Output>();

  handleSubmit((data) => {
    expect(data).type.toBe<Output>();
  });
});
