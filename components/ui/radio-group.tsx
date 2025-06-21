"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { CircleIcon } from "lucide-react"

function RadioGroup({
  className = "",
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      className={`grid gap-3 ${className}`.trim()}
      {...props}
    />
  )
}

function RadioGroupItem({
  className = "",
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={`border-gray-300 text-blue-600 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 aria-invalid:ring-red-500 aria-invalid:border-red-500 dark:bg-gray-800 dark:border-gray-600 aspect-square size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50 ${className}`.trim()}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-blue-600 absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
