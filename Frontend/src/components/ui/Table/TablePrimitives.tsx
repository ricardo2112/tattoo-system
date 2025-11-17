/**
 * Table Primitives Components
 * Basic table components for custom table layouts
 */

import { forwardRef, type HTMLAttributes } from 'react';

export interface TableProps extends HTMLAttributes<HTMLTableElement> {
  hoverable?: boolean;
}

export interface TrProps extends HTMLAttributes<HTMLTableRowElement> {}
export interface ThProps extends HTMLAttributes<HTMLTableCellElement> {}
export interface TdProps extends HTMLAttributes<HTMLTableCellElement> {}
export interface TheadProps extends HTMLAttributes<HTMLTableSectionElement> {}
export interface TbodyProps extends HTMLAttributes<HTMLTableSectionElement> {}

export const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ className = '', hoverable, ...props }, ref) => {
    return (
      <table
        ref={ref}
        className={`w-full border-collapse ${className}`}
        {...props}
      />
    );
  }
);

Table.displayName = 'Table';

export const THead = forwardRef<HTMLTableSectionElement, TheadProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <thead
        ref={ref}
        className={className}
        {...props}
      />
    );
  }
);

THead.displayName = 'THead';

export const TBody = forwardRef<HTMLTableSectionElement, TbodyProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <tbody
        ref={ref}
        className={className}
        {...props}
      />
    );
  }
);

TBody.displayName = 'TBody';

export const Tr = forwardRef<HTMLTableRowElement, TrProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={className}
        {...props}
      />
    );
  }
);

Tr.displayName = 'Tr';

export const Th = forwardRef<HTMLTableCellElement, ThProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={`px-4 py-3 text-left text-sm font-medium ${className}`}
        {...props}
      />
    );
  }
);

Th.displayName = 'Th';

export const Td = forwardRef<HTMLTableCellElement, TdProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={`px-4 py-3 text-sm ${className}`}
        {...props}
      />
    );
  }
);

Td.displayName = 'Td';
