import { ReactNode } from 'react';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalProps {
  /**
   * Whether the modal is open
   */
  isOpen: boolean;

  /**
   * Callback when modal should close
   */
  onClose: () => void;

  /**
   * Modal content
   */
  children: ReactNode;

  /**
   * Modal title (optional)
   */
  title?: string;

  /**
   * Size of the modal
   * @default 'md'
   */
  size?: ModalSize;

  /**
   * Close modal when clicking outside
   * @default true
   */
  closeOnOverlayClick?: boolean;

  /**
   * Show close button
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Custom className for modal content
   */
  className?: string;
}

export interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
}

export interface ModalBodyProps {
  children: ReactNode;
  className?: string;
}

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}
