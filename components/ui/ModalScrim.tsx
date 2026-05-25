"use client";

export function ModalScrim({
  onDismiss,
  label = "Close",
}: {
  onDismiss: () => void;
  label?: string;
}) {
  return (
    <button
      type="button"
      className="absolute inset-0 bg-zinc-950/65 backdrop-blur-md dark:bg-black/75"
      onClick={onDismiss}
      aria-label={label}
    />
  );
}
