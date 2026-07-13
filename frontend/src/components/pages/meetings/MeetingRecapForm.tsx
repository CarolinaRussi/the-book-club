import { ImagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { compressImageFile } from "@/utils/compressImageFile";

export const MAX_MEETING_RECAP_IMAGE_BYTES = 10 * 1024 * 1024;

export type MeetingRecapFormValue = {
  text: string;
  imageFile: File | null;
  existingImageUrl: string | null;
  removeImage: boolean;
};

interface MeetingRecapFormProps {
  value: MeetingRecapFormValue;
  onChange: (value: MeetingRecapFormValue) => void;
  disabled?: boolean;
  idPrefix?: string;
}

export function emptyMeetingRecapFormValue(
  existing?: { text?: string | null; imageUrl?: string | null } | null,
): MeetingRecapFormValue {
  return {
    text: existing?.text ?? "",
    imageFile: null,
    existingImageUrl: existing?.imageUrl ?? null,
    removeImage: false,
  };
}

export function meetingRecapHasContent(value: MeetingRecapFormValue) {
  const hasText = value.text.trim().length > 0;
  const hasImage =
    Boolean(value.imageFile) ||
    (Boolean(value.existingImageUrl) && !value.removeImage);
  return hasText || hasImage;
}

export default function MeetingRecapForm({
  value,
  onChange,
  disabled = false,
  idPrefix = "meeting-recap",
}: MeetingRecapFormProps) {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (!value.imageFile) {
      setObjectUrl(null);
      return;
    }
    const nextUrl = URL.createObjectURL(value.imageFile);
    setObjectUrl(nextUrl);
    return () => URL.revokeObjectURL(nextUrl);
  }, [value.imageFile]);

  const previewUrl = objectUrl
    ? objectUrl
    : value.removeImage
      ? null
      : value.existingImageUrl;

  const isBusy = disabled || isCompressing;

  return (
    <div className="flex flex-col gap-3">
      <div>
        <h3 className="text-lg font-medium mb-1">Como foi o encontro?</h3>
        <textarea
          id={`${idPrefix}-text`}
          value={value.text}
          disabled={isBusy}
          onChange={(event) =>
            onChange({ ...value, text: event.target.value })
          }
          placeholder="Conta um pouco do que rolou, das conversas, do clima…"
          rows={4}
          className="border-2 border-secondary rounded-md p-2 w-full text-foreground bg-background min-h-24 resize-y"
        />
      </div>

      <div>
        <h3 className="text-lg font-medium mb-1">Foto (opcional)</h3>
        {previewUrl ? (
          <div className="relative overflow-hidden rounded-md border border-secondary">
            <img
              src={previewUrl}
              alt="Prévia da foto do encontro"
              className="max-h-56 w-full object-cover"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={isBusy}
              className="absolute right-2 top-2"
              onClick={() =>
                onChange({
                  ...value,
                  imageFile: null,
                  removeImage: true,
                })
              }
            >
              <X className="h-4 w-4 mr-1" />
              Remover foto
            </Button>
          </div>
        ) : (
          <label
            htmlFor={`${idPrefix}-image`}
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-secondary px-4 py-6 text-center text-sm text-muted-foreground"
          >
            <ImagePlus className="h-6 w-6" />
            <span>
              {isCompressing
                ? "Otimizando foto…"
                : "Toque para escolher uma foto"}
            </span>
            <Input
              id={`${idPrefix}-image`}
              type="file"
              accept="image/*"
              disabled={isBusy}
              className="sr-only"
              onChange={async (event) => {
                const file = event.target.files?.[0] ?? null;
                event.target.value = "";
                if (!file) return;

                setIsCompressing(true);
                try {
                  const compressed = await compressImageFile(file, {
                    maxBytes: MAX_MEETING_RECAP_IMAGE_BYTES,
                  });
                  onChange({
                    ...valueRef.current,
                    imageFile: compressed,
                    removeImage: false,
                  });
                } catch (error) {
                  toast.error(
                    error instanceof Error
                      ? error.message
                      : "Não foi possível processar a foto. Tente outra imagem.",
                  );
                } finally {
                  setIsCompressing(false);
                }
              }}
            />
          </label>
        )}
      </div>
    </div>
  );
}
