'use client';

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ErrorMessage } from './ErrorMessage';
import { useAuth } from '@/hooks/useAuth';
import { RegisterSchema } from '@/lib/validation';
import axios from 'axios';
import { ZodError } from 'zod';

interface RegisterFormProps {
  onSuccess?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess }) => {
  const router = useRouter();
  const { register: authRegister, loading } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

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

    if (!agreeToTerms) {
      setServerError('You must agree to the terms and conditions');
      return;
    }

    try {
      const validated = RegisterSchema.parse(formData);
      await authRegister(
        validated.firstName,
        validated.lastName,
        validated.email,
        validated.password
      );
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
      } else if (axios.isAxiosError<{ message?: string }>(err)) {
        setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
      } else if (err instanceof Error) {
        setServerError(err.message);
      } else {
        setServerError('Registration failed. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-[14px]">
      {serverError && (
        <ErrorMessage
          message={serverError}
          onDismiss={() => setServerError(null)}
        />
      )}

      <div className="grid grid-cols-2 gap-[14px]">
        <label className="block">
          <span className="mb-[7px] block text-[15px] font-medium text-[#171717]">First Name</span>
          <input
            name="firstName"
            type="text"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className={`h-[50px] w-full rounded-[6px] border bg-white px-4 text-[15px] outline-none placeholder:text-[#9da4af] focus:border-[#168bff] ${
              errors.firstName ? 'border-[#ef4444]' : 'border-[#d8dce3]'
            }`}
          />
          {errors.firstName && <span className="mt-1 block text-[12px] font-medium text-[#ef4444]">{errors.firstName}</span>}
        </label>
        <label className="block">
          <span className="mb-[7px] block text-[15px] font-medium text-[#171717]">Last Name</span>
          <input
            name="lastName"
            type="text"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className={`h-[50px] w-full rounded-[6px] border bg-white px-4 text-[15px] outline-none placeholder:text-[#9da4af] focus:border-[#168bff] ${
              errors.lastName ? 'border-[#ef4444]' : 'border-[#d8dce3]'
            }`}
          />
          {errors.lastName && <span className="mt-1 block text-[12px] font-medium text-[#ef4444]">{errors.lastName}</span>}
        </label>
      </div>

      <label className="block">
        <span className="mb-[7px] block text-[15px] font-medium text-[#171717]">Email</span>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
          className={`h-[50px] w-full rounded-[6px] border bg-white px-4 text-[15px] outline-none placeholder:text-[#9da4af] focus:border-[#168bff] ${
            errors.email ? 'border-[#ef4444]' : 'border-[#d8dce3]'
          }`}
        />
        {errors.email && <span className="mt-1 block text-[12px] font-medium text-[#ef4444]">{errors.email}</span>}
      </label>

      <label className="block">
        <span className="mb-[7px] block text-[15px] font-medium text-[#171717]">Password</span>
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
          className={`h-[50px] w-full rounded-[6px] border bg-white px-4 text-[15px] outline-none placeholder:text-[#9da4af] focus:border-[#168bff] ${
            errors.password ? 'border-[#ef4444]' : 'border-[#d8dce3]'
          }`}
        />
        {errors.password && <span className="mt-1 block text-[12px] font-medium text-[#ef4444]">{errors.password}</span>}
      </label>

      <label className="block">
        <span className="mb-[7px] block text-[15px] font-medium text-[#171717]">Repeat Password</span>
        <input
          name="confirmPassword"
          type="password"
          placeholder="Repeat Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className={`h-[50px] w-full rounded-[6px] border bg-white px-4 text-[15px] outline-none placeholder:text-[#9da4af] focus:border-[#168bff] ${
            errors.confirmPassword ? 'border-[#ef4444]' : 'border-[#d8dce3]'
          }`}
        />
        {errors.confirmPassword && <span className="mt-1 block text-[12px] font-medium text-[#ef4444]">{errors.confirmPassword}</span>}
      </label>

      <label className="flex cursor-pointer items-center gap-[9px] pt-[2px] text-[14px] font-medium text-[#676e7a]">
        <input
          type="checkbox"
          checked={agreeToTerms}
          onChange={(e) => setAgreeToTerms(e.target.checked)}
          className="h-[16px] w-[16px] rounded-[3px] border border-[#c8ced8] accent-[#168bff]"
        />
        I agree to terms & conditions
      </label>

      <button
        type="submit"
        disabled={loading}
        className="mt-[6px] flex h-[52px] w-full items-center justify-center rounded-[6px] bg-[#168bff] text-[17px] font-semibold text-white transition-colors hover:bg-[#067df0] disabled:cursor-not-allowed disabled:bg-[#9acbff]"
      >
        {loading ? 'Loading...' : 'Create Account'}
      </button>
    </form>
  );
};

RegisterForm.displayName = 'RegisterForm';
