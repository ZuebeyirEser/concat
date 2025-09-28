import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { cn } from "@/utils"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"

export interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  type: string
  startElement?: React.ReactNode
  errors?: Record<string, any>
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, type, startElement, errors, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const fieldName = type
    const error = errors?.[fieldName]

    return (
      <div className="space-y-2">
        <Label htmlFor={fieldName} className="capitalize">
          {fieldName.replace(/_/g, " ")}
        </Label>
        <div className="relative">
          {startElement && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {startElement}
            </div>
          )}
          <Input
            id={fieldName}
            type={showPassword ? "text" : "password"}
            className={cn(
              startElement && "pl-10",
              "pr-10",
              error && "border-red-500",
              className
            )}
            ref={ref}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
            disabled={props.disabled}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-500">{error.message}</p>
        )}
      </div>
    )
  }
)
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }