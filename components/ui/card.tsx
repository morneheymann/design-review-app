import * as React from "react"

function Card({ className = "", ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`bg-white text-gray-900 flex flex-col gap-6 rounded-xl border border-gray-200 py-6 shadow-sm dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 ${className}`.trim()}
      {...props}
    />
  )
}

function CardHeader({ className = "", ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 ${className}`.trim()}
      {...props}
    />
  )
}

function CardTitle({ className = "", ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`leading-none font-semibold ${className}`.trim()}
      {...props}
    />
  )
}

function CardDescription({ className = "", ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`text-gray-600 text-sm dark:text-gray-400 ${className}`.trim()}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={`col-start-2 row-span-2 row-start-1 self-start justify-self-end ${className}`.trim()}
      {...props}
    />
  )
}

function CardContent({ className = "", ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`px-6 ${className}`.trim()}
      {...props}
    />
  )
}

function CardFooter({ className = "", ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={`flex items-center px-6 ${className}`.trim()}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
