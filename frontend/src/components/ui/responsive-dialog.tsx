import * as React from "react";
import { XIcon } from "lucide-react";

import { useMediaQuery } from "@/hooks/useMediaQuery";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

type OverlayVariant = "dialog" | "drawer";

type ResponsiveDialogContextValue = {
  isDesktop: boolean;
};

const ResponsiveDialogContext =
  React.createContext<ResponsiveDialogContextValue | null>(null);

function useResponsiveDialogContext() {
  const context = React.useContext(ResponsiveDialogContext);
  if (!context) {
    throw new Error(
      "ResponsiveDialog components must be used within ResponsiveDialog"
    );
  }
  return context;
}

function useLockedOverlayVariant(open: boolean | undefined) {
  const matchesDesktop = useMediaQuery(DESKTOP_MEDIA_QUERY);
  const [lockedVariant, setLockedVariant] =
    React.useState<OverlayVariant | null>(null);

  React.useEffect(() => {
    if (!open) {
      setLockedVariant(null);
      return;
    }

    setLockedVariant(
      (currentVariant) =>
        currentVariant ?? (matchesDesktop ? "dialog" : "drawer")
    );
  }, [open, matchesDesktop]);

  if (open && lockedVariant) {
    return lockedVariant === "dialog";
  }

  return matchesDesktop;
}

type ResponsiveDialogProps = React.ComponentProps<typeof Dialog> & {
  dismissible?: boolean;
};

function ResponsiveDialog({
  dismissible = true,
  open,
  onOpenChange,
  children,
  ...props
}: ResponsiveDialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : uncontrolledOpen;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    onOpenChange?.(nextOpen);
  };

  const isDesktop = useLockedOverlayVariant(isOpen);

  if (isDesktop) {
    return (
      <ResponsiveDialogContext.Provider value={{ isDesktop: true }}>
        <Dialog open={isOpen} onOpenChange={handleOpenChange} {...props}>
          {children}
        </Dialog>
      </ResponsiveDialogContext.Provider>
    );
  }

  return (
    <ResponsiveDialogContext.Provider value={{ isDesktop: false }}>
      <Drawer
        open={isOpen}
        onOpenChange={handleOpenChange}
        dismissible={dismissible}
        shouldScaleBackground={false}
        {...props}
      >
        {children}
      </Drawer>
    </ResponsiveDialogContext.Provider>
  );
}

function ResponsiveDialogTrigger(
  props: React.ComponentProps<typeof DialogTrigger>
) {
  const { isDesktop } = useResponsiveDialogContext();
  return isDesktop ? <DialogTrigger {...props} /> : <DrawerTrigger {...props} />;
}

function ResponsiveDialogClose(
  props: React.ComponentProps<typeof DialogClose>
) {
  const { isDesktop } = useResponsiveDialogContext();
  return isDesktop ? <DialogClose {...props} /> : <DrawerClose {...props} />;
}

function ResponsiveDialogContent({
  className,
  children,
  showCloseButton = true,
  flush = false,
  ...props
}: React.ComponentProps<typeof DialogContent> & {
  showCloseButton?: boolean;
  flush?: boolean;
}) {
  const { isDesktop } = useResponsiveDialogContext();

  if (isDesktop) {
    return (
      <DialogContent
        className={className}
        showCloseButton={showCloseButton}
        {...props}
      >
        {children}
      </DialogContent>
    );
  }

  return (
    <DrawerContent
      className={cn(
        "flex h-[90dvh] max-h-[90dvh] flex-col gap-0 overflow-hidden p-0",
        className,
        "w-full! max-w-none!"
      )}
      {...props}
    >
      <div
        className={cn(
          "relative flex min-h-0 flex-1 flex-col overflow-hidden",
          flush ? "p-0" : "px-6 pt-2 pb-6"
        )}
      >
        {children}
        {showCloseButton && (
          <DrawerClose
            data-slot="drawer-close"
            className={cn(
              "absolute cursor-pointer rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none",
              flush ? "top-4 right-4" : "top-2 right-4"
            )}
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close</span>
          </DrawerClose>
        )}
      </div>
    </DrawerContent>
  );
}

function ResponsiveDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { isDesktop } = useResponsiveDialogContext();

  if (isDesktop) {
    return <DialogHeader className={className} {...props} />;
  }

  return (
    <DrawerHeader
      className={cn("shrink-0 gap-1.5 p-0 text-left", className)}
      {...props}
    />
  );
}

function ResponsiveDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { isDesktop } = useResponsiveDialogContext();

  if (isDesktop) {
    return <DialogFooter className={className} {...props} />;
  }

  return (
    <DrawerFooter
      className={cn("shrink-0 gap-2 p-0 pt-4", className)}
      {...props}
    />
  );
}

function ResponsiveDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogTitle>) {
  const { isDesktop } = useResponsiveDialogContext();

  if (isDesktop) {
    return <DialogTitle className={className} {...props} />;
  }

  return <DrawerTitle className={className} {...props} />;
}

function ResponsiveDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogDescription>) {
  const { isDesktop } = useResponsiveDialogContext();

  if (isDesktop) {
    return <DialogDescription className={className} {...props} />;
  }

  return <DrawerDescription className={className} {...props} />;
}

function ResponsiveDialogBody({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { isDesktop } = useResponsiveDialogContext();

  if (isDesktop) {
    return <div className={className} {...props} />;
  }

  return (
    <div
      data-slot="responsive-dialog-body"
      className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain", className)}
      {...props}
    />
  );
}

export {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogClose,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
};
