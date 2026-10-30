import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "button shrink-0 whitespace-nowrap select-none disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "button-primary",
        accent: "button-accent",
        outline: "button-outline",
        secondary: "button-quiet",
        ghost: "button-ghost",
        destructive: "button-destructive",
        link: "button-link",
      },
      size: {
        default: "min-h-12",
        xs: "min-h-8 px-3 text-xs",
        sm: "min-h-10 px-4 text-sm",
        lg: "min-h-14 px-7",
        icon: "size-12 p-0 justify-center",
        "icon-xs": "size-8 p-0 justify-center",
        "icon-sm": "size-10 p-0 justify-center",
        "icon-lg": "size-14 p-0 justify-center",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({ className, variant = "default", size = "default", ...props }: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return <ButtonPrimitive data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
