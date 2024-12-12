import Link from "next/link";
import Image from "next/image";

export default function Sidebar() {
  return (
    <div className="flex h-screen">
      <aside className={`bg-gray-100 w-64 h-screen overflow-y-auto`}>
        <div className="p-4">
          <div className="mb-8">
            <Link className="flex justify-start items-center gap-1" href="/">
              <Image
                alt="Logo"
                src="/qtasnim-logo.png"
                height={50}
                width={150}
              />
            </Link>
          </div>
          <ul>
            <li className="mb-2">
              <Link
                className="block px-4 py-2 hover:bg-gray-200 rounded-md"
                href="/dashboard"
              >
                Home
              </Link>
            </li>
            <li className="mb-2">
              <Link
                className="block px-4 py-2 hover:bg-gray-200 rounded-md"
                href="/dashboard/barang"
              >
                Barang
              </Link>
            </li>
            <li className="mb-2">
              <Link
                href="/dashboard/transaksi"
                className="block px-4 py-2 hover:bg-gray-200 rounded-md"
              >
                Transaksi
              </Link>
            </li>
            <li className="mb-2">
              <Link
                href="/dashboard/jenis-barang"
                className="block px-4 py-2 hover:bg-gray-200 rounded-md"
              >
                Jenis Barang
              </Link>
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
