'use client';

import { useAuth } from '@/hooks/useAuth';
import { LoginSchema } from '@/lib/validation';
import { ApiClientError } from '@/lib/axios/errors';
import { useRouter } from 'next/navigation';
import React, { ChangeEvent, FormEvent, useState } from 'react';
import { ZodError } from 'zod';
import { ErrorMessage } from './ErrorMessage';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const { login: authLogin, loading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);

    try {
      const validated = LoginSchema.parse(formData);
      await authLogin(validated.email, validated.password);
      if (onSuccess) onSuccess();
      router.push('/feed');
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((error) => {
          if (error.path[0]) {
            fieldErrors[String(error.path[0])] = error.message;
          }
        });
        setErrors(fieldErrors);
      } else if (err instanceof ApiClientError) {
        setServerError(err.message || 'Login failed. Please try again.');
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Login failed. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-[18px] ">
      {serverError && (
        <ErrorMessage
          message={serverError}
          onDismiss={() => setServerError(null)}
        />
      )}

      <label className="block">
        <span className="mb-[8px] block text-[15px] font-medium text-[#171717]">Email</span>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
          className={`h-[52px] w-full rounded-[6px] border bg-white px-4 text-[15px] font-normal text-[#171717] outline-none transition-colors placeholder:text-[#9da4af] focus:border-[#168bff] ${
            errors.email ? 'border-[#ef4444]' : 'border-[#d8dce3]'
          }`}
        />
        {errors.email && <span className="mt-1 block text-[12px] font-medium text-[#ef4444]">{errors.email}</span>}
      </label>

      <label className="block">
        <span className="mb-[8px] block text-[15px] font-medium text-[#171717]">Password</span>
        <input
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
          className={`h-[52px] w-full rounded-[6px] border bg-white px-4 text-[15px] font-normal text-[#171717] outline-none transition-colors placeholder:text-[#9da4af] focus:border-[#168bff] ${
            errors.password ? 'border-[#ef4444]' : 'border-[#d8dce3]'
          }`}
        />
        {errors.password && <span className="mt-1 block text-[12px] font-medium text-[#ef4444]">{errors.password}</span>}
      </label>

      <div className="flex items-center justify-between pt-[2px]">
        <label className="flex cursor-pointer items-center gap-[9px] text-[14px] font-medium text-[#676e7a]">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-[16px] w-[16px] rounded-[3px] border border-[#c8ced8] accent-[#168bff]"
          />
          Remember me
        </label>
        <a href="#" className="text-[14px] font-medium text-[#168bff] underline underline-offset-2">
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-[6px] flex h-[52px] w-full items-center justify-center rounded-[6px] bg-[#168bff] text-[17px] font-semibold text-white transition-colors hover:bg-[#067df0] disabled:cursor-not-allowed disabled:bg-[#9acbff]"
      >
        {loading ? 'Loading...' : 'Login now'}
      </button>
    </form>
  );
};

LoginForm.displayName = 'LoginForm';
