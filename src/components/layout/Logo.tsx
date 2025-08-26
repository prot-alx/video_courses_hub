import Link from "next/link";

export default function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 hover:opacity-80 transition-opacity"
    >
      <h1
        className="text-xl font-semibold"
        style={{ color: "var(--color-text-primary)", cursor: "pointer" }}
      >
        <span className="hidden md:inline">🎓 Образовательная школа</span>
        <span className="md:hidden">На главную</span>
      </h1>
    </Link>
  );
}
