import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <h2 style={{ color: "var(--color-text-primary)", cursor: "pointer" }}>
        <span>🎓</span>
      </h2>
    </Link>
  );
}
