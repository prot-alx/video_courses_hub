import Link from "next/link";

interface NavItem {
  href: string;
  label: string;
  badge?: number;
  isActive?: boolean;
}

interface AdminNavigationProps {
  items: NavItem[];
}

export default function AdminNavigation({
  items,
}: Readonly<AdminNavigationProps>) {
  return (
    <nav className="flex gap-4 mb-8">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`btn-discord relative ${
            item.isActive ? "btn-discord-primary" : "btn-discord-secondary"
          }`}
        >
          {item.label}
          {item.badge && item.badge > 0 && (
            <span className="notification-badge absolute -top-2 -right-2">
              {item.badge}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
