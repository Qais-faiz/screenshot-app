'use client';

import { useState, useEffect, useRef } from "react";
import { X, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export function FeedbackModal({ isOpen, onClose, pageSource }) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionData, setActionData] = useState(null);
  
  const modalRef = useRef(null);
  const emailInputRef = useRef(null);

  // Focus email input when modal opens
  useEffect(() => {
    if (isOpen && emailInputRef.current) {
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Close modal and reset form
  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      // Reset form after animation
      setTimeout(() => {
        setEmail("");
        setMessage("");
        setErrors({});
        setActionData(null);
      }, 300);
    }
  };

  // Validate email format
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!validateEmail(email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!message.trim()) {
      newErrors.message = "Message is required";
    } else if (message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    } else if (message.trim().length > 1000) {
      newErrors.message = "Message must not exceed 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle successful submission
  useEffect(() => {
    if (actionData?.success) {
      // Close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  }, [actionData]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setActionData(null);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          message,
          pageSource,
        }),
      });

      const data = await response.json();
      setActionData(data);
    } catch (error) {
      setActionData({
        success: false,
        error: 'Failed to send feedback. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Character count for message
  const characterCount = message.length;
  const maxCharacters = 1000;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-title"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-[#252525] border border-[#3A3A3A] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
        style={{ fontFamily: "Instrument Sans, Inter, system-ui, sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#3A3A3A]">
          <h2
            id="feedback-title"
            className="text-xl font-semibold text-white"
          >
            Send Feedback
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-[#AAAAAA] hover:text-white transition-colors p-1 rounded-lg hover:bg-[#3A3A3A] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close feedback form"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email Input */}
          <div>
            <label
              htmlFor="feedback-email"
              className="block text-sm font-medium text-[#CCCCCC] mb-2"
            >
              Email
            </label>
            <input
              ref={emailInputRef}
              id="feedback-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors({ ...errors, email: null });
                }
              }}
              placeholder="your@email.com"
              disabled={isSubmitting}
              required
              className={`w-full px-4 py-2.5 bg-[#1E1E1E] border ${
                errors.email ? "border-red-500" : "border-[#3A3A3A]"
              } rounded-xl text-white placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {errors.email && (
              <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.email}
              </p>
            )}
          </div>

          {/* Message Textarea */}
          <div>
            <label
              htmlFor="feedback-message"
              className="block text-sm font-medium text-[#CCCCCC] mb-2"
            >
              Message
            </label>
            <textarea
              id="feedback-message"
              name="message"
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                if (errors.message) {
                  setErrors({ ...errors, message: null });
                }
              }}
              placeholder="Share your thoughts, suggestions, or report issues..."
              rows={6}
              disabled={isSubmitting}
              required
              minLength={10}
              maxLength={1000}
              className={`w-full px-4 py-2.5 bg-[#1E1E1E] border ${
                errors.message ? "border-red-500" : "border-[#3A3A3A]"
              } rounded-xl text-white placeholder-[#666666] focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:border-transparent transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            <div className="flex items-center justify-between mt-1.5">
              {errors.message ? (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.message}
                </p>
              ) : (
                <div />
              )}
              <p
                className={`text-sm ${
                  characterCount > maxCharacters
                    ? "text-red-400"
                    : characterCount > maxCharacters * 0.9
                      ? "text-yellow-400"
                      : "text-[#666666]"
                }`}
              >
                {characterCount}/{maxCharacters}
              </p>
            </div>
          </div>

          {/* Status Message */}
          {actionData && (
            <div
              className={`p-3 rounded-xl flex items-center gap-2 ${
                actionData.success
                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                  : "bg-red-500/10 text-red-400 border border-red-500/20"
              }`}
            >
              {actionData.success ? (
                <CheckCircle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <p className="text-sm">{actionData.success ? actionData.message : actionData.error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || actionData?.success}
            className="w-full px-6 py-3 bg-gradient-to-t from-[#8B70F6] to-[#9D7DFF] hover:from-[#7E64F2] hover:to-[#8B70F6] text-white font-semibold rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#8B70F6] focus:ring-offset-2 focus:ring-offset-[#252525] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Sending...
              </>
            ) : actionData?.success ? (
              <>
                <CheckCircle size={18} />
                Sent!
              </>
            ) : (
              <>
                <Send size={18} />
                Send Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
