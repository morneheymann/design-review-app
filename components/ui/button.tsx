import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

interface ButtonProps extends React.ComponentProps<"button"> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const baseClasses = "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"

    const variantClasses = {
      default: "bg-blue-600 text-white shadow-sm hover:bg-blue-700",
      destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500",
      outline: "border border-gray-300 bg-white shadow-sm hover:bg-gray-50 hover:text-gray-900 dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700",
      secondary: "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700",
      ghost: "hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800",
      link: "text-blue-600 underline-offset-4 hover:underline"
    }

    const sizeClasses = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md gap-1.5 px-3",
      lg: "h-10 rounded-md px-6",
      icon: "size-9"
    }

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`.trim()

    return (
      <Comp
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button }
