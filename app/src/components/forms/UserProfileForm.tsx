import React from 'react';
import {
  FormProvider,
  useForm,
  useFormState,
  useWatch,
  type Control,
} from 'react-hook-form';
import BasicInfoSection from './BasicInfoSection';
import ContactSection from './ContactSection';
import SkillsSection from './SkillsSection';
import WorkExperienceSection from './WorkExperienceSection';
import SocialLinksSection from './SocialLinksSection';

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfileFormValues {
  firstName: string;
  lastName: string;
  username: string;
  age: number;
  email: string;
  phoneNumbers: { value: string }[];
  skills: { skillName: string; skillLevel: SkillLevel }[];
  workExperiences: { company: string; role: string; years: number }[];
  github: string;
  linkedin: string;
  website: string;
}

function SubmitButton({ control }: { control: Control<UserProfileFormValues> }) {
  const { isSubmitting } = useFormState({ control });

  return (
    <button type="submit" disabled={isSubmitting}>
      {isSubmitting ? '提交中...' : '提交'}
    </button>
  );
}

function FormPreview({ control }: { control: Control<UserProfileFormValues> }) {
  const values = useWatch({ control });

  return (
    <section className="form-section">
      <h2>表单实时预览</h2>
      <pre className="form-preview">{JSON.stringify(values, null, 2)}</pre>
    </section>
  );
}

export default function UserProfileForm() {
  const methods = useForm<UserProfileFormValues>({
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      username: '',
      age: 18,
      email: '',
      phoneNumbers: [{ value: '' }],
      skills: [{ skillName: '', skillLevel: 'beginner' }],
      workExperiences: [{ company: '', role: '', years: 0 }],
      github: '',
      linkedin: '',
      website: '',
    },
  });

  const [submittedData, setSubmittedData] =
    React.useState<UserProfileFormValues | null>(null);

  const onSubmit = async (data: UserProfileFormValues) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmittedData(data);
  };

  return (
    <FormProvider {...methods}>
      <form
        className="user-profile-form"
        onSubmit={methods.handleSubmit(onSubmit)}
      >
        <h1>用户资料管理表单</h1>

        <BasicInfoSection />
        <ContactSection />
        <SkillsSection />
        <WorkExperienceSection />
        <SocialLinksSection />

        <SubmitButton control={methods.control} />
        <FormPreview control={methods.control} />

        {submittedData && (
          <section className="form-section">
            <h2>提交结果</h2>
            <pre className="form-preview">
              {JSON.stringify(submittedData, null, 2)}
            </pre>
          </section>
        )}
      </form>
    </FormProvider>
  );
}
