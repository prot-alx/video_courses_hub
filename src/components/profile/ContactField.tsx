interface ContactFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  helpText?: string;
  required?: boolean;
  maxLength?: number;
  showCounter?: boolean;
  error?: string;
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
  maxLength,
  showCounter = false,
  error,
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
        maxLength={maxLength}
        className={`w-full input-discord disabled:opacity-50 disabled:cursor-not-allowed ${
          error || (maxLength && value.length > maxLength)
            ? "border-red-500"
            : ""
        }`}
        style={error || (maxLength && value.length > maxLength) ? {
          borderColor: "#ef4444"
        } : {}}
      />
      {(error || helpText || showCounter) && (
        <div
          className={`mt-1 ${
            showCounter && (helpText || error)
              ? "flex justify-between items-center"
              : ""
          }`}
        >
          {error ? (
            <p className="text-xs text-red-500">{error}</p>
          ) : helpText ? (
            <p
              className="text-xs"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {helpText}
            </p>
          ) : null}
          {showCounter && maxLength && (
            <span
              className={`text-xs ${
                value.length > maxLength ? "text-red-500" : "text-gray-500"
              }`}
            >
              {value.length}/{maxLength}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
