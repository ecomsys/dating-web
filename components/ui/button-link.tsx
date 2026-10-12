import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { type VariantProps } from "class-variance-authority";

interface ButtonLinkProps 
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof buttonVariants> {
  href: string;
}

export function ButtonLink({
  children,
  href,
  variant = "secondary",
  size = "sm",
  className,
  ...props // <--- Добавляем это, чтобы можно было передавать target, rel и т.д.
}: ButtonLinkProps) {
  return (
    <a
      href={href}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props} 
    >
      {children}
    </a>
  );
}