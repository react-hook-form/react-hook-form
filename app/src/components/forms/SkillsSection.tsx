import React, { memo, useEffect } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import FieldError from './FieldError';
import type { UserProfileFormValues } from './UserProfileForm';

const SkillsSection: React.FC = memo(() => {
  const {
    register,
    control,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useFormContext<UserProfileFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'skills',
  });

  useEffect(() => {
    if (fields.length < 1) {
      setError('skills', {
        type: 'manual',
        message: '请至少添加 1 个技能',
      });
      return;
    }

    if (fields.length > 10) {
      setError('skills', {
        type: 'manual',
        message: '最多只能添加 10 个技能',
      });
      return;
    }

    clearErrors('skills');
  }, [fields.length, setError, clearErrors]);

  return (
    <fieldset disabled={isSubmitting}>
      <legend>技能列表</legend>
      <p>最少 1 个技能，最多 10 个技能</p>

      <FieldError message={errors.skills?.message as string | undefined} />

      {fields.map((field, index) => (
        <div
          key={field.id}
          style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}
        >
          <input
            {...register(`skills.${index}.skillName` as const, {
              required: 'Skill name is required',
            })}
            placeholder="Skill name"
          />

          <select {...register(`skills.${index}.skillLevel` as const)}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <button
            type="button"
            onClick={() => remove(index)}
            disabled={fields.length <= 1}
          >
            Remove
          </button>

          <FieldError message={errors.skills?.[index]?.skillName?.message} />
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ skillName: '', skillLevel: 'beginner' })}
        disabled={fields.length >= 10}
      >
        Add Skill
      </button>
    </fieldset>
  );
});

export default SkillsSection;
