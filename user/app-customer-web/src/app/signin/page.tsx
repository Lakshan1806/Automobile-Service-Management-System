'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { signin } from '@/services/auth';
import Button from '@/components/Button/Button';
import FormInput from '@/components/FormInput/FormInput';
import styles from './SignIn.module.css';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await signin({ email, password });
      localStorage.setItem(
        'customer-auth',
        JSON.stringify({
          token: response.accessToken,
          expiresIn: response.expiresIn,
          customer: response.customer,
        })
      );
      router.push('/tracking');
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Failed to sign in.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <h1>Sign In</h1>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        <FormInput label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <FormInput
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in…' : 'Continue'}
        </Button>
      </form>
      <p className={styles.swap}>
        No account? <Link href="/signup">Sign up</Link>
      </p>
    </div>
  );
}
