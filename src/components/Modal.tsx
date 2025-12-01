// src/components/Modal.tsx
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { X, Package, CheckCircle2 } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  shorten?: boolean;
  maxLength?: number;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

const sizeMap = {
  sm: "max-w-xs",
  md: "max-w-md",
  lg: "max-w-lg",
};

const backdropVariants: Variants = {
  hidden: { opacity: 0, backdropFilter: "blur(0px)" },
  visible: { opacity: 1, backdropFilter: "blur(6px)" },
};

const panelVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 400, damping: 28, mass: 0.6 },
  },
  exit: {
    opacity: 0,
    y: 12,
    scale: 0.985,
    transition: { duration: 0.18 },
  },
};

const headerIconVariants: Variants = {
  hidden: { scale: 0, rotate: -30, opacity: 0 },
  visible: { scale: 1, rotate: 0, opacity: 1, transition: { type: "spring", stiffness: 400, damping: 18 } },
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  subtitle,
  children,
  onClose,
  footer,
  shorten = false,
  maxLength = 80,
  size = "md",
  showIcon = true,
  className = "",
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  // Ensure portal root exists
  useEffect(() => {
    let root = document.getElementById("modal-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "modal-root";
      document.body.appendChild(root);
    }
    setPortalRoot(root);
  }, []);

  // Escape key to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  // Disable background scroll
  useEffect(() => {
    if (isOpen) document.documentElement.style.overflow = "hidden";
    else document.documentElement.style.overflow = "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [isOpen]);

  const renderChildren = () => {
    if (!children) return <p className="text-sm text-slate-600">Quick info</p>;
    if (shorten && typeof children === "string") {
      const raw = children.trim();
      if (raw.length <= maxLength) return <p className="text-sm text-slate-700 leading-snug">{raw}</p>;
      const truncated = raw.slice(0, maxLength);
      const lastSpace = truncated.lastIndexOf(" ");
      const text = truncated.slice(0, Math.max(10, lastSpace)) + "…";
      return <p className="text-sm text-slate-700 leading-snug">{text}</p>;
    }
    return <div className="text-sm text-slate-700 leading-relaxed">{children}</div>;
  };

  if (!portalRoot) return null; // wait until portal root exists

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="modal-root"
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4 sm:px-2"
          initial="hidden"
          animate="visible"
          exit="hidden"
          aria-modal="true"
          role="dialog"
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            aria-hidden
            style={{ backdropFilter: "blur(6px)" }}
          />

          {/* Panel */}
          <motion.div
            ref={contentRef}
            className={`relative z-10 w-full ${sizeMap[size]} mx-auto ${className}`}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onMouseDown={(e) => e.stopPropagation()}
            role="document"
            tabIndex={-1}
          >
            <div className="relative bg-white/95 dark:bg-slate-900/95 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 overflow-hidden">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {showIcon && (
                    <motion.div
                      variants={headerIconVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-rose-500 to-fuchsia-500 text-white shadow-lg"
                    >
                      <Package className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.div>
                  )}
                  <div>
                    {title && <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
                    {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
                  </div>
                </div>

                {/* Close button */}
                <button
                  aria-label="Close modal"
                  onClick={onClose}
                  className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/70 hover:bg-white shadow-sm border border-slate-100"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
                </button>
              </div>

              {/* Body */}
              <div className="mt-4 sm:mt-5">{renderChildren()}</div>

                {/* Footer */}
                {footer !== null && (
                <div className="mt-5 sm:mt-6 flex sm:flex-row items-end sm:items-center justify-end gap-2 sm:gap-3">
                    {footer ? (
                    footer
                    ) : (
                    <div className="flex gap-2 sm:gap-3">
                        <button
                        onClick={onClose}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm bg-slate-100 hover:bg-slate-200 text-slate-800"
                        >
                        Dismiss
                        </button>
                        <button
                        onClick={onClose}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md hover:scale-[1.02] transition"
                        >
                        Confirm
                        </button>
                    </div>
                    )}
                </div>
                )}

            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalRoot
  );
};

export default Modal;
