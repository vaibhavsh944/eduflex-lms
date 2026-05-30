import * as React from "react"
import { cn } from "@/lib/utils"
import { Circle } from "lucide-react"

// Simple mock for Radix RadioGroup to avoid complex dependency
const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (val: string) => void
}>({})

export function RadioGroup({ 
  value, 
  onValueChange, 
  className, 
  children 
}: { 
  value?: string, 
  onValueChange?: (val: string) => void, 
  className?: string, 
  children: React.ReactNode 
}) {
  return (
    <RadioGroupContext.Provider value={{ value, onValueChange }}>
      <div className={cn("grid gap-2", className)}>{children}</div>
    </RadioGroupContext.Provider>
  )
}

export const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, ...props }, ref) => {
  const ctx = React.useContext(RadioGroupContext)
  const checked = ctx.value === value

  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      onClick={() => ctx.onValueChange?.(value)}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center",
        className
      )}
      ref={ref}
      {...props}
    >
      {checked && (
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      )}
    </button>
  )
})
RadioGroupItem.displayName = "RadioGroupItem"
