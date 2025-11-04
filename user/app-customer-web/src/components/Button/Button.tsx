'use client';

import { type ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ children, ...rest }: Props) {
  return (
    <button className={styles.btn} {...rest}>
      {children}
    </button>
  );
}
