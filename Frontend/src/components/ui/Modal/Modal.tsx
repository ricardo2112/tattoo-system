/**
 * Modal Component
 *
 * A flexible modal dialog component with customizable size and behavior.
 * Supports overlay click to close and escape key handling.
 *
 * @example
 * ```tsx
 * <Modal isOpen={isOpen} onClose={handleClose} title="My Modal" size="md">
 *   <Modal.Header>Custom Header</Modal.Header>
 *   <Modal.Body>Modal content here</Modal.Body>
 *   <Modal.Footer>
 *     <Button onClick={handleClose}>Close</Button>
 *   </Modal.Footer>
 * </Modal>
 * ```
 */

import { useEffect, useRef, forwardRef } from 'react';
import { X } from 'lucide-react';
import type {
  ModalProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
} from './Modal.types';

const Modal: React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Body: React.FC<ModalBodyProps>;
  Footer: React.FC<ModalFooterProps>;
} = ({
  isOpen,
  onClose,
  children,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Size styles
  const sizeStyles: Record<typeof size, string> = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-fade-in"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`relative w-full ${sizeStyles[size]} bg-card rounded-lg shadow-xl animate-slide-in-from-bottom ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            {title && (
              <h2
                id="modal-title"
                className="text-xl font-semibold text-foreground"
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

// Modal Header subcomponent
const ModalHeader = forwardRef<HTMLDivElement, ModalHeaderProps>(
  ({ children, className = '' }, ref) => {
    return (
      <div
        ref={ref}
        className={`border-b border-border px-6 py-4 ${className}`}
      >
        {children}
      </div>
    );
  }
);

ModalHeader.displayName = 'Modal.Header';

// Modal Body subcomponent
const ModalBody = forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ children, className = '' }, ref) => {
    return (
      <div ref={ref} className={`px-6 py-4 ${className}`}>
        {children}
      </div>
    );
  }
);

ModalBody.displayName = 'Modal.Body';

// Modal Footer subcomponent
const ModalFooter = forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ children, className = '' }, ref) => {
    return (
      <div
        ref={ref}
        className={`flex items-center justify-end gap-3 border-t border-border px-6 py-4 ${className}`}
      >
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'Modal.Footer';

// Attach subcomponents
Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

export default Modal;
