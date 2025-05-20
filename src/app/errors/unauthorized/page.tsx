import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="flex items-center min-h-screen px-4 py-12 sm:px-6 md:px-8 lg:px-12 xl:px-16">
      <div className="w-full space-y-6 text-center">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-red-600">
            Unauthorized
          </h1>
          <p className="text-gray-500">
           You do not have permission to view this page.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex h-10 items-center rounded-md border border-gray-200 bg-white shadow-sm px-8 text-sm font-medium transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-800 dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus-visible:ring-gray-300"
          prefetch={false}
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}
