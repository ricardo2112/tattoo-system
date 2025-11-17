/**
 * Card Component
 *
 * A flexible card component with header, body, and footer sections.
 * Supports multiple variants and hover effects.
 *
 * @example
 * ```tsx
 * <Card variant="elevated" hoverable>
 *   <Card.Header>Title</Card.Header>
 *   <Card.Body>Content</Card.Body>
 *   <Card.Footer>Footer</Card.Footer>
 * </Card>
 * ```
 */

import { forwardRef } from 'react';
import type {
  CardProps,
  CardHeaderProps,
  CardBodyProps,
  CardFooterProps,
} from './Card.types';

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      hoverable = false,
      padding = true,
      className = '',
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles = 'bg-card rounded-lg transition-all duration-200';

    // Variant styles
    const variantStyles: Record<typeof variant, string> = {
      default: 'border border-border',
      bordered: 'border-2 border-border',
      elevated: 'shadow-md',
    };

    // Hover styles
    const hoverStyles = hoverable
      ? 'hover:shadow-lg hover:scale-[1.02] cursor-pointer'
      : '';

    // Padding styles
    const paddingStyles = padding ? 'p-6' : '';

    // Combine all styles
    const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${hoverStyles} ${paddingStyles} ${className}`;

    return (
      <div ref={ref} className={combinedStyles} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Header subcomponent
const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`mb-4 ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'Card.Header';

// Card Body subcomponent
const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`${className}`} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'Card.Body';

// Card Footer subcomponent
const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`mt-4 pt-4 border-t border-border ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'Card.Footer';

// Attach subcomponents to Card
const CardWithSubcomponents = Object.assign(Card, {
  Header: CardHeader,
  Body: CardBody,
  Footer: CardFooter,
});

export default CardWithSubcomponents;
