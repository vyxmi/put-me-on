"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useCurrentUser, useUpdateProfile } from "@/lib/data/store";
import { CheckGlyph } from "@/components/icons/UtilityIcons";

function Field({
  label,
  value,
  onChange,
  prefix,
  error,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  error?: string;
  maxLength?: number;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-detail text-[11px] font-bold uppercase tracking-wider text-text-tertiary">{label}</label>
      <div className="flex items-center gap-1 border-0 border-b border-border pb-1.5 focus-within:border-white-edge">
        {prefix ? <span className="text-[16px] text-text-tertiary">{prefix}</span> : null}
        <input
          type="text"
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border-0 bg-transparent text-[16px] text-text-primary outline-none"
        />
      </div>
      {error ? <p className="text-[12px] text-warn">{error}</p> : null}
    </div>
  );
}

export function AccountSettings() {
  const user = useCurrentUser();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState(user.displayName);
  const [handle, setHandle] = useState(user.handle);
  const [errors, setErrors] = useState<{ displayName?: string; handle?: string }>({});
  const [saved, setSaved] = useState(false);

  const dirty = displayName !== user.displayName || handle !== user.handle;

  function handleSave() {
    const nextErrors: typeof errors = {};

    if (displayName !== user.displayName) {
      const result = updateProfile({ displayName });
      if (!result.ok) nextErrors.displayName = result.error;
    }
    if (handle !== user.handle) {
      const result = updateProfile({ handle });
      if (!result.ok) nextErrors.handle = result.error;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    }
  }

  function handleReset() {
    setDisplayName(user.displayName);
    setHandle(user.handle);
    setErrors({});
  }

  return (
    <div
      className="flex flex-col gap-5 rounded-sm border px-5 py-5"
      style={{ background: "var(--glass)", borderColor: "var(--border-strong)" }}
    >
      <Field
        label="display name"
        value={displayName}
        onChange={(v) => setDisplayName(v)}
        error={errors.displayName}
        maxLength={40}
      />
      <Field
        label="handle"
        value={handle}
        onChange={(v) => setHandle(v.toLowerCase().replace(/\s+/g, ""))}
        prefix="@"
        error={errors.handle}
        maxLength={24}
      />

      <AnimatePresence mode="wait" initial={false}>
        {dirty ? (
          <motion.div
            key="actions"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 overflow-hidden pt-1"
          >
            <button type="button" onClick={handleSave} className="btn-primary rounded-xs px-4 py-2 text-[13px] font-semibold">
              save changes
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="text-[13px] text-text-tertiary transition-colors hover:text-text-primary"
            >
              cancel
            </button>
          </motion.div>
        ) : saved ? (
          <motion.p
            key="saved"
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 text-[13px] text-text-secondary"
          >
            <CheckGlyph size={11} className="text-text-primary" />
            saved
          </motion.p>
        ) : null}
      </AnimatePresence>

      <p className="hairline pt-4 text-[13px] text-text-tertiary">session and notification settings will live here.</p>
    </div>
  );
}
