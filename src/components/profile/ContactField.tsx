interface ContactFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  helpText?: string;
  required?: boolean;
}

export default function ContactField({
  label,
  value,
  onChange,
  disabled = false,
  placeholder,
  type = "text",
  helpText,
  required = false,
}: Readonly<ContactFieldProps>) {
  return (
    <div>
      <label
        className="block text-sm font-medium mb-2"
        style={{ color: "var(--color-text-primary)" }}
      >
        {label}{" "}
        {required && <span style={{ color: "var(--color-danger)" }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded border disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: disabled
            ? "var(--color-primary-400)"
            : "var(--color-primary-100)",
          borderColor: "var(--color-primary-400)",
          color: disabled
            ? "var(--color-text-secondary)"
            : "var(--color-primary-400)",
        }}
      />
      {helpText && (
        <p
          className="text-xs mt-1"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {helpText}
        </p>
      )}
    </div>
  );
}
