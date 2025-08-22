const SocialLink = ({
  href,
  icon,
  name,
}: {
  href: string;
  icon: string;
  name: string;
}) => (
  <a
    href={href}
    className="flex items-center gap-2 px-4 py-2 rounded-lg border hover:opacity-80 transition-opacity"
    style={{
      background: "var(--color-primary-100)",
      borderColor: "var(--color-primary-400)",
      color: "var(--color-primary-400)",
    }}
  >
    {icon} {name}
  </a>
);

export default function SocialMediaLinks() {
  const socialLinks = [
    { href: "#", icon: "📘", name: "VK" },
    { href: "#", icon: "📱", name: "Telegram" },
    { href: "#", icon: "📸", name: "Instagram" },
  ];

  return (
    <div className="mt-8">
      <h3
        className="text-lg font-semibold mb-4"
        style={{ color: "var(--color-text-primary)" }}
      >
        📱 Мы в социальных сетях
      </h3>
      <div className="flex gap-4">
        {socialLinks.map((link, index) => (
          <SocialLink
            key={index}
            href={link.href}
            icon={link.icon}
            name={link.name}
          />
        ))}
      </div>
    </div>
  );
}
