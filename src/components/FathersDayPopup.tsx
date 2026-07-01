"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AnimatedSwapText from "@/components/AnimatedSwapText";

const POPUP_SESSION_KEY = "duks_fathersday_popup_dismissed";

export default function FathersDayPopup() {
  const [show, setShow] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    let root = document.getElementById("modal-root");
    if (!root) {
      root = document.createElement("div");
      root.id = "modal-root";
      document.body.appendChild(root);
    }
    setPortalRoot(root);
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem(POPUP_SESSION_KEY)) return;

    const handleScroll = () => {
      if (triggeredRef.current) return;
      triggeredRef.current = true;
      setShow(true);
    };

    window.addEventListener("scroll", handleScroll, { once: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem(POPUP_SESSION_KEY, "true");
    setShow(false);
  };

  useEffect(() => {
    if (show) {
      document.documentElement.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [show]);

  const stagger = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.25 } },
  };

  const fadeUp = (y = 20) => ({
    hidden: { opacity: 0, y },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
  });

  if (!portalRoot) return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          key="fathersday-popup"
          className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          aria-modal="true"
          role="dialog"
          onMouseDown={(e) => e.target === e.currentTarget && dismiss()}
        >
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" as any }}
            animate={{ opacity: 1, backdropFilter: "blur(8px)" as any }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" as any }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            aria-hidden
          />

          <motion.div
            className="relative z-10 w-full max-w-sm sm:max-w-lg mx-auto"
            initial={{ opacity: 0, y: 40, scale: 0.93 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 380, damping: 24, mass: 0.65 }}
            onMouseDown={(e) => e.stopPropagation()}
            role="document"
          >
            <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden">
              <motion.div
                className="w-full h-96 sm:h-72 relative overflow-hidden"
                initial={{ scale: 1.08 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <img
                  src="/fathersday.jpeg"
                  alt="Father's Day"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                <motion.button
                  aria-label="Close"
                  onClick={dismiss}
                  className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-md hover:bg-white/40 transition-colors"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.35, type: "spring", stiffness: 400, damping: 18 }}
                  whileHover={{ scale: 1.15, backgroundColor: "rgba(255,255,255,0.4)" }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-4 h-4 text-white" />
                </motion.button>
                <motion.div
                  className="absolute bottom-4 left-4"
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45, duration: 0.4, ease: "easeOut" }}
                >
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white">
                    ðŸŽ Limited Edition
                  </span>
                </motion.div>
              </motion.div>

              <motion.div
                className="p-6 sm:p-8 text-center space-y-4"
                variants={stagger}
                initial="hidden"
                animate="visible"
              >
                <motion.h2
                  variants={fadeUp(24)}
                  className="text-2xl sm:text-3xl font-heading font-extrabold text-neutral-900 leading-tight"
                >
                  Celebrate Dad with
                  <br />
                  <motion.span
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-green-500 bg-clip-text text-transparent inline-block"
                    animate={{ backgroundPosition: ["0% center", "100% center", "0% center"] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    style={{ backgroundSize: "200% auto" }}
                  >
                    the Gift of Wellness
                  </motion.span>
                </motion.h2>

                <motion.p
                  variants={fadeUp(16)}
                  className="text-sm sm:text-base font-body text-neutral-600 leading-relaxed max-w-sm mx-auto"
                >
                  Treat the father figure in your life to Duks' finest cold-pressed juices and curated wellness bundles.
                </motion.p>

                <motion.div variants={fadeUp(20)} className="pt-1">
                  <Button
                    asChild
                    size="lg"
                    onClick={dismiss}
                    className="w-full sm:w-auto rounded-full px-8 py-5 font-semibold tracking-wide shadow-lg bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:scale-105 active:scale-[0.98] transition-all text-white"
                  >
                    <Link href="/products/bundle" className="flex items-center justify-center gap-2">
                      <AnimatedSwapText texts={["Shop Bundles", "Order Now"]} />
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                      >
                        <ArrowRight className="w-5 h-5" />
                      </motion.span>
                    </Link>
                  </Button>
                </motion.div>

                <motion.p
                  variants={fadeUp(10)}
                  className="text-xs text-neutral-400 font-body"
                >
                  Limited availability â€¢ Order now
                </motion.p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    portalRoot
  );
}
