'use client';

import { type HTMLInputTypeAttribute } from 'react';
import styles from './FormInput.module.css';

type Props = {
  label: string;
  type?: HTMLInputTypeAttribute;
  value: string;
  onChange: (val: string) => void;
  autoComplete?: string;
};

export default function FormInput({ label, type = 'text', value, onChange, autoComplete }: Props) {
  return (
    <label className={styles.block}>
      <span className={styles.label}>{label}</span>
      <input
        className={styles.input}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        required
      />
    </label>
  );
}
