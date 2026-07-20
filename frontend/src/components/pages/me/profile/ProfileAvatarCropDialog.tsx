import { useState, useCallback, useEffect } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import {
  ResponsiveDialog,
  ResponsiveDialogBody,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "../../../ui/responsive-dialog";
import { Button } from "../../../ui/button";
import { getCroppedAvatarBlob } from "../../../../utils/cropAvatarImage";

type ProfileAvatarCropDialogProps = {
  open: boolean;
  imageSrc: string | null;
  onOpenChange: (open: boolean) => void;
  onCropComplete: (file: File) => void;
};

export default function ProfileAvatarCropDialog({
  open,
  imageSrc,
  onOpenChange,
  onCropComplete,
}: ProfileAvatarCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
    null
  );
  const [isApplying, setIsApplying] = useState(false);

  const onCropCompleteCb = useCallback(
    (_croppedArea: Area, croppedAreaPixelsInner: Area) => {
      setCroppedAreaPixels(croppedAreaPixelsInner);
    },
    []
  );

  useEffect(() => {
    if (imageSrc) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [imageSrc]);

  const resetUi = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  };

  const handleDismiss = (nextOpen: boolean) => {
    if (isApplying && !nextOpen) return;
    if (!nextOpen) resetUi();
    onOpenChange(nextOpen);
  };

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsApplying(true);
    try {
      const blob = await getCroppedAvatarBlob(imageSrc, croppedAreaPixels);
      const file = new File([blob], "avatar.jpg", {
        type: "image/jpeg",
      });
      onCropComplete(file);
      resetUi();
      onOpenChange(false);
    } catch {
      /* opcional: toast no pai */
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={handleDismiss}
      dismissible={false}
    >
      <ResponsiveDialogContent
        className="sm:max-w-md"
        showCloseButton={!isApplying}
        onPointerDownOutside={(event) => {
          if (isApplying) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (isApplying) event.preventDefault();
        }}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Ajustar foto</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Arraste para posicionar e use o zoom para enquadrar o rosto.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <ResponsiveDialogBody className="space-y-4">
            {imageSrc ? (
              <>
                <div className="relative h-[min(60vh,320px)] w-full overflow-hidden rounded-lg bg-muted">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    cropShape="round"
                    showGrid={false}
                    onCropChange={setCrop}
                    onCropComplete={onCropCompleteCb}
                    onZoomChange={setZoom}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="avatar-crop-zoom"
                    className="text-sm text-muted-foreground"
                  >
                    Zoom
                  </label>
                  <input
                    id="avatar-crop-zoom"
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </>
            ) : null}
          </ResponsiveDialogBody>

          <ResponsiveDialogFooter className="mt-4 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDismiss(false)}
              disabled={isApplying}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              disabled={!croppedAreaPixels || isApplying}
            >
              {isApplying ? "Gerando…" : "Usar esta foto"}
            </Button>
          </ResponsiveDialogFooter>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
