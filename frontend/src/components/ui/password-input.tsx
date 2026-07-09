import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type">;

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, ...props }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(
            "w-full rounded-lg border-2 border-secondary bg-background p-2.5 pr-10 text-foreground",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-warm-brown transition-colors hover:text-foreground"
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <EyeOff className="h-4 w-4 cursor-pointer" aria-hidden />
          ) : (
            <Eye className="h-4 w-4 cursor-pointer" aria-hidden />
          )}
        </button>
      </div>
    );
  },
);

export { PasswordInput };
