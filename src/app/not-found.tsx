// app/not-found.tsx
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[92vh] h-full flex flex-col items-center justify-center text-center px-4 py-10">
      <Image
        src="/browser.png"
        alt="Not Found"
        width={200}
        height={100}
        className="mb-8"
      />
      <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground mb-6 max-w-md">
        The page you're looking for doesn’t exist or has expired. Please check
        the URL or return to the homepage.
      </p>
      <Link
        href="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Back to Home
      </Link>
    </div>
  );
}
