import type { HTMLAttributes, ReactNode } from 'react';

export type CardVariant = 'default' | 'bordered' | 'elevated';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Card content
   */
  children: ReactNode;

  /**
   * Visual variant of the card
   * @default 'default'
   */
  variant?: CardVariant;

  /**
   * Add hover effect
   * @default false
   */
  hoverable?: boolean;

  /**
   * Add padding
   * @default true
   */
  padding?: boolean;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}
