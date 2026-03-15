import React from 'react';
import {
  FormProvider,
  useForm,
  useFormState,
  useWatch,
  type Control,
  type SubmitHandler,
} from 'react-hook-form';
import BasicInfoSection from './BasicInfoSection';
import ContactSection from './ContactSection';
import SkillsSection from './SkillsSection';
import WorkExperienceSection from './WorkExperienceSection';
import SocialLinksSection from './SocialLinksSection';

export type PhoneNumber = {
  number: string;
};

export type Skill = {
  skillName: string;
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
};

export type WorkExperience = {
  company: string;
  role: string;
  years: number;
};

export type SocialLinks = {
  github: string;
  linkedin: string;
  website: string;
};

export type UserProfileFormValues = {
  firstName: string;
  lastName: string;
  username: string;
  age: number;
  email: string;
  phoneNumbers: PhoneNumber[];
  skills: Skill[];
  workExperiences: WorkExperience[];
  socialLinks: SocialLinks;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function FormPreview({
  control,
}: {
  control: Control<UserProfileFormValues>;
}) {
  const values = useWatch({ control });

  return (
    <section className="form-section">
      <h3>表单实时预览</h3>
      <pre className="form-preview">{JSON.stringify(values, null, 2)}</pre>
    </section>
  );
}

function SubmitButton({
  control,
}: {
  control: Control<UserProfileFormValues>;
}) {
  const { isSubmitting, isValid, isValidating } = useFormState({ control });

  return (
    <div className="form-actions">
      <div className="form-status">
        <span>验证中：{isValidating ? '是' : '否'}</span>
        <span>表单有效：{isValid ? '是' : '否'}</span>
      </div>

      <button type="submit" disabled={isSubmitting || !isValid}>
        {isSubmitting ? '提交中...' : '提交表单'}
      </button>
    </div>
  );
}

export default function UserProfileForm() {
  const methods = useForm<UserProfileFormValues>({
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      age: 18,
      email: '',
      phoneNumbers: [{ number: '' }],
      skills: [{ skillName: '', skillLevel: 'beginner' }],
      workExperiences: [{ company: '', role: '', years: 0 }],
      socialLinks: {
        github: '',
        linkedin: '',
        website: '',
