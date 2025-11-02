'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { signup } from '@/services/auth';
import Button from '@/components/Button/Button';
import FormInput from '@/components/FormInput/FormInput';
import styles from './SignUp.module.css';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      await signup({ name, email, password });
      setSuccess('Account created successfully. You can now sign in.');
      setName('');
      setEmail('');
      setPassword('');
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : 'Failed to create account.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <h1>Create account</h1>
      {error && <p className={styles.error}>{error}</p>}
      {success && <p className={styles.success}>{success}</p>}
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <FormInput label="Name" value={name} onChange={setName} autoComplete="name" />
        <FormInput label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <FormInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating account…' : 'Sign up'}
        </Button>
      </form>
      <p className={styles.swap}>
        Have an account? <Link href="/signin">Sign in</Link>
      </p>
    </div>
  );
}
