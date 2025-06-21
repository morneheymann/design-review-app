import * as React from "react"

function Input({ className = "", type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={`file:text-gray-900 placeholder:text-gray-500 selection:bg-blue-600 selection:text-white dark:bg-gray-800 dark:border-gray-600 flex h-9 w-full min-w-0 rounded-md border border-gray-300 bg-transparent px-3 py-1 text-base shadow-sm transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:text-gray-100 dark:placeholder:text-gray-400 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 aria-invalid:ring-red-500 aria-invalid:border-red-500 ${className}`.trim()}
      {...props}
    />
  )
}

export { Input }
