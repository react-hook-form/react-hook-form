import * as yup from 'yup';
// import validateWithSchema from './validateWithSchema';

describe('validateWithSchema', () => {
  it('', async () => {
    const SignupSchema = yup.object().shape({
      name: yup.string().required(),
      age: yup
        .number()
        .required()
        .positive()
        .integer(),
      email: yup.string().email(),
      website: yup.string().url(),
      createdOn: yup.date().default(function() {
        return new Date();
      }),
    });
    try {
      const result = await SignupSchema.validate(
        {
        },
        { abortEarly: false },
      );
    } catch (e) {
      console.log(e);
    }

    // console.log(result);
  });
});
