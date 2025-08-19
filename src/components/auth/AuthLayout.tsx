interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxWidth?: "sm" | "md" | "lg";
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  maxWidth = "md",
}: Readonly<AuthLayoutProps>) {
  const getMaxWidth = () => {
    switch (maxWidth) {
      case "sm":
        return "max-w-sm";
      case "lg":
        return "max-w-lg";
      default:
        return "max-w-md";
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-primary-200)" }}
    >
      <div className={`w-full ${getMaxWidth()}`}>
        {/* Logo and Platform Name */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            📚 VideoCourses
          </h1>
          <p style={{ color: "var(--color-text-secondary)" }}>
            Платформа видеокурсов
          </p>
        </div>

        {/* Auth Card */}
        <div
          className="p-8 rounded-lg border"
          style={{
            background: "var(--color-primary-300)",
            borderColor: "var(--color-primary-400)",
          }}
        >
          {/* Page Title and Subtitle */}
          {(title || subtitle) && (
            <div className="text-center mb-8">
              {title && (
                <h2
                  className="text-xl font-semibold mb-4"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {title}
                </h2>
              )}
              {subtitle && (
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          )}

          {/* Content */}
          {children}
        </div>
      </div>
    </div>
  );
}
