"use client";

import { ArrowDown, ArrowUp, ChevronDown, Eye, EyeOff, ImagePlus, Loader2, Trash2, X } from "lucide-react";
import { useId, useRef, useState, useTransition, type ComponentProps, type ReactNode } from "react";
import { uploadImage } from "@/app/admin/actions";
import { splitList } from "@/lib/list";

export const inputClass =
  "w-full rounded-lg border border-hairline-strong bg-surface px-3 py-2 text-[0.9375rem] text-fg placeholder:text-fg-subtle/70 transition-colors focus:border-accent focus:outline-none";

export const buttonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-hairline-strong bg-surface px-3 py-1.5 text-sm font-medium text-fg transition-colors hover:bg-hairline/60 disabled:pointer-events-none disabled:opacity-50";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent px-3.5 py-1.5 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-40";

const iconButtonClass =
  "inline-flex size-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-hairline/70 hover:text-fg disabled:pointer-events-none disabled:opacity-30";

/** A labelled control. Use `as="div"` when the control holds several buttons (a <label> would capture their clicks). */
export function Field({
  label,
  hint,
  as: Tag = "label",
  children,
}: {
  label: string;
  hint?: string;
  as?: "label" | "div";
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Tag className="block space-y-1.5">
        <span className="block text-sm font-medium text-fg">{label}</span>
        {children}
      </Tag>
      {/* Outside the label, so the hint is not read out as part of the field's name. */}
      {hint && <p className="text-xs text-fg-subtle">{hint}</p>}
    </div>
  );
}

export function Group({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-serif text-xl tracking-tight text-fg">{title}</h2>
        {description && <p className="mt-1 text-sm text-fg-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

type TextInputProps = Omit<ComponentProps<"input">, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

export function TextInput({ value, onChange, className, ...props }: TextInputProps) {
  return (
    <input
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} ${className ?? ""}`}
    />
  );
}

type TextAreaProps = Omit<ComponentProps<"textarea">, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
};

export function TextArea({ value, onChange, className, ...props }: TextAreaProps) {
  return (
    <textarea
      {...props}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${inputClass} resize-y leading-relaxed ${className ?? ""}`}
    />
  );
}

/**
 * Edits a string list as delimited text. The raw text is kept locally so that
 * typing "React, " does not lose its trailing separator mid-edit.
 */
export function ListInput({
  value,
  onChange,
  separator,
  rows,
  placeholder,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  separator: "," | "\n";
  rows?: number;
  placeholder?: string;
}) {
  const joiner = separator === "," ? ", " : "\n";
  const [raw, setRaw] = useState(() => value.join(joiner));
  const update = (next: string) => {
    setRaw(next);
    onChange(splitList(next, separator));
  };

  return separator === "," ? (
    <TextInput value={raw} onChange={update} placeholder={placeholder} />
  ) : (
    <TextArea value={raw} onChange={update} rows={rows ?? 8} placeholder={placeholder} />
  );
}

export function ImageField({
  value,
  onChange,
  shape,
}: {
  value: string;
  onChange: (path: string) => void;
  shape: "round" | "wide";
}) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const upload = (file: File) => {
    setError(null);
    const form = new FormData();
    form.append("file", file);
    startTransition(async () => {
      const result = await uploadImage(form);
      if (result.ok) onChange(result.path);
      else setError(result.error);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-4">
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin preview of an uploaded file
        <img
          src={value}
          alt=""
          className={`border border-hairline object-cover ${shape === "round" ? "size-16 rounded-full" : "aspect-video w-40 rounded-lg"}`}
        />
      ) : (
        <div
          className={`flex items-center justify-center border border-dashed border-hairline-strong text-fg-subtle ${shape === "round" ? "size-16 rounded-full" : "aspect-video w-40 rounded-lg"}`}
        >
          <ImagePlus className="size-5" aria-hidden />
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={buttonClass} disabled={pending} onClick={() => input.current?.click()}>
          {pending && <Loader2 className="size-3.5 animate-spin" aria-hidden />}
          {value ? "Replace image" : "Upload image"}
        </button>
        {value && (
          <button type="button" className={buttonClass} onClick={() => onChange("")}>
            <X className="size-3.5" aria-hidden />
            Remove
          </button>
        )}
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) upload(file);
          }}
        />
        <span className="w-full text-xs text-fg-subtle">PNG, JPEG, WebP, AVIF or GIF, up to 5 MB.</span>
        {error && (
          <p role="alert" className="w-full text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * A collapsible card for one list entry, with show/hide, reorder and delete
 * controls in its header.
 */
export function ItemCard({
  title,
  meta,
  visible,
  onToggleVisible,
  onMoveUp,
  onMoveDown,
  onDelete,
  defaultOpen = false,
  children,
}: {
  title: string;
  meta?: ReactNode;
  visible?: boolean;
  onToggleVisible?: () => void;
  onMoveUp?: (() => void) | undefined;
  onMoveDown?: (() => void) | undefined;
  onDelete: () => void;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = useId();
  const hidden = visible === false;

  return (
    <div className={`rounded-xl border bg-surface ${hidden ? "border-dashed border-hairline-strong" : "border-hairline"}`}>
      <div className="flex items-center gap-1 py-1.5 pr-1.5 pl-2">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={bodyId}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-hairline/50"
        >
          <ChevronDown
            className={`size-4 shrink-0 text-fg-subtle transition-transform ${open ? "" : "-rotate-90"}`}
            aria-hidden
          />
          <span className={`truncate font-medium ${hidden ? "text-fg-subtle" : "text-fg"}`}>{title || "Untitled"}</span>
          {hidden && <span className="shrink-0 text-xs text-fg-subtle">Hidden</span>}
          {meta && <span className="ml-auto hidden shrink-0 text-xs text-fg-subtle sm:inline">{meta}</span>}
        </button>
        {onToggleVisible && (
          <button
            type="button"
            className={iconButtonClass}
            onClick={onToggleVisible}
            aria-label={hidden ? `Show ${title} on the site` : `Hide ${title} from the site`}
            title={hidden ? "Hidden from the site: click to show" : "Shown on the site: click to hide"}
          >
            {hidden ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
          </button>
        )}
        <button type="button" className={iconButtonClass} onClick={onMoveUp} disabled={!onMoveUp} aria-label="Move up">
          <ArrowUp className="size-4" aria-hidden />
        </button>
        <button type="button" className={iconButtonClass} onClick={onMoveDown} disabled={!onMoveDown} aria-label="Move down">
          <ArrowDown className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          className={`${iconButtonClass} hover:text-danger`}
          onClick={() => {
            if (confirm(`Delete "${title || "Untitled"}"? You can still undo by not saving.`)) onDelete();
          }}
          aria-label={`Delete ${title}`}
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
      {open && (
        <div id={bodyId} className="space-y-4 border-t border-hairline px-4 py-4">
          {children}
        </div>
      )}
    </div>
  );
}
