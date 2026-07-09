import { forwardRef, useState } from "react";
import { Eye, EyeClosed } from "lucide-react";
import { cn } from "@/lib/utils";

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  containerClassName?: string;
};

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput({ className, containerClassName, ...props }, ref) {
    const [visible, setVisible] = useState(false);

    return (
      <div className={cn("grid w-full", containerClassName)}>
        <input
          ref={ref}
          type={visible ? "text" : "password"}
          className={cn(
            "col-start-1 row-start-1 w-full rounded-lg border-2 border-secondary bg-background p-2.5 pr-10 text-foreground",
            className,
          )}
          {...props}
        />
        <button
          type="button"
          tabIndex={-1}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          className="col-start-1 row-start-1 z-10 mr-2.5 flex items-center self-center justify-self-end text-warm-brown transition-colors hover:text-foreground"
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? (
            <Eye className="h-4 w-4 cursor-pointer" aria-hidden />
          ) : (
            <EyeClosed className="h-4 w-4 cursor-pointer" aria-hidden />
          )}
        </button>
      </div>
    );
  },
);

export { PasswordInput };
