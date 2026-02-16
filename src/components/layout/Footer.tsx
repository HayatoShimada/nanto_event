import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-primary text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-lg font-bold tracking-tight">南砺市イベント</p>
            <p className="mt-2 text-sm text-white/50">
              南砺市のイベント情報を一か所に。
            </p>
          </div>
          <div className="flex gap-8 text-xs tracking-widest text-white/60 uppercase">
            <a
              href="https://note.com/nantofam710"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              ひだっち
            </a>
            <a
              href="https://85-store.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              85-Store
            </a>
            <Link href="/contact" className="hover:text-white">
              お問い合わせ
            </Link>
          </div>
        </div>
        <div className="mt-10 border-t border-white/10 pt-6">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} 南砺市イベントページ
          </p>
        </div>
      </div>
    </footer>
  );
}
