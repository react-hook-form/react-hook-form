import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { UserProfileFormValues } from './UserProfileForm';
import FieldError from './FieldError';

const takenUsernames = ['admin', 'root', 'system'];

async function validateUsername(username: string) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (!username) return true;

  if (takenUsernames.includes(username.trim().toLowerCase())) {
    return '用户名已被占用';
  }

  return true;
}

function BasicInfoSectionInner() {
  const {
    register,
    formState: { errors },
  } = useFormContext<UserProfileFormValues>();

  return (
    <section className="form-section">
      <h2>基础信息</h2>

      <label>
        名
        <input
          {...register('firstName', {
            required: '请输入名字',
            minLength: {
              value: 2,
              message: '至少输入 2 个字符',
            },
          })}
        />
        <FieldError message={errors.firstName?.message} />
      </label>

      <label>
        姓
        <input
          {...register('lastName', {
            required: '请输入姓氏',
            minLength: {
              value: 2,
              message: '至少输入 2 个字符',
            },
          })}
        />
        <FieldError message={errors.lastName?.message} />
      </label>

      <label>
        用户名
        <input
          {...register('username', {
            required: '请输入用户名',
            validate: validateUsername,
          })}
        />
        <FieldError message={errors.username?.message} />
      </label>

      <label>
        年龄
        <input
          type="number"
          {...register('age', {
            valueAsNumber: true,
            required: '请输入年龄',
            min: {
              value: 18,
              message: '年龄不能小于 18',
            },
            max: {
              value: 65,
              message: '年龄不能大于 65',
            },
          })}
        />
        <FieldError message={errors.age?.message} />
      </label>
    </section>
  );
}

const BasicInfoSection = React.memo(BasicInfoSectionInner);

export default BasicInfoSection;
