import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import ButtonCancel from './ButtonCancel';

export default function CenteredInfoModal({
  title = 'Detalles',
  content,
  children,
  triggerClassName = '',
  contentClassName = 'w-max min-w-full whitespace-nowrap text-sm text-gray-100',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      trigger?.focus();
    };
  }, [isOpen]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`skip-style-btn cursor-pointer ${triggerClassName}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        {children}
      </button>

      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsOpen(false);
          }}
        >
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="w-max max-w-[90vw] max-h-[85vh] overflow-hidden rounded-xl border border-gray-700 bg-[#2f3d44] p-6 text-white shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 id={titleId} className="text-lg font-bold">
                {title}
              </h2>
              <ButtonCancel onClose={() => setIsOpen(false)} text="Cerrar" />
            </div>

            <div className="max-w-[calc(90vw-4rem)] max-h-[calc(85vh-6rem)] overflow-auto rounded-lg bg-black/10 p-4">
              <div className={contentClassName}>
                {content}
              </div>
            </div>
          </section>
        </div>,
        document.body
      )}
    </>
  );
}
