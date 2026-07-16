import { Camera } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/utils/formatters";

type MyProfileEditFormProps = {
  isPending: boolean;
  displayPicture?: string;
  draftName: string;
  draftNickname: string;
  draftBio: string;
  tags: string[];
  genreInput: string;
  onDraftNameChange: (value: string) => void;
  onDraftNicknameChange: (value: string) => void;
  onDraftBioChange: (value: string) => void;
  onGenreInputChange: (value: string) => void;
  onAddTag: () => void;
  onRemoveTag: (tag: string) => void;
  onPickImageFile: (file: File) => void;
  onRemoveImage: () => void;
  onCancel: () => void;
  onSave: () => void;
};

export function MyProfileEditForm({
  isPending,
  displayPicture,
  draftName,
  draftNickname,
  draftBio,
  tags,
  genreInput,
  onDraftNameChange,
  onDraftNicknameChange,
  onDraftBioChange,
  onGenreInputChange,
  onAddTag,
  onRemoveTag,
  onPickImageFile,
  onRemoveImage,
  onCancel,
  onSave,
}: MyProfileEditFormProps) {
  return (
    <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
      <div className="flex flex-col items-center gap-2">
        <label className="group relative block cursor-pointer">
          <Avatar className="size-28 shrink-0 sm:size-32 md:size-36">
            <AvatarImage
              src={displayPicture || undefined}
              alt={draftNickname || draftName}
            />
            <AvatarFallback className="text-3xl text-primary" delayMs={600}>
              {getInitials(draftNickname || draftName || "")}
            </AvatarFallback>
          </Avatar>
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-8 w-8 text-foreground" />
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              if (file) onPickImageFile(file);
            }}
          />
        </label>
        {displayPicture ? (
          <button
            type="button"
            onClick={onRemoveImage}
            className="cursor-pointer text-sm text-primary hover:underline"
          >
            Remover foto
          </button>
        ) : null}
      </div>

      <div className="min-w-0 w-full flex-1 space-y-5 sm:w-auto">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="profile-nickname"
            className="text-sm font-medium text-foreground"
          >
            Apelido
          </label>
          <p className="text-sm text-muted-foreground">
            Como você aparece no clube (feed, leitores, comentários).
          </p>
          <Input
            id="profile-nickname"
            disabled={isPending}
            value={draftNickname}
            onChange={(event) => onDraftNicknameChange(event.target.value)}
            className="max-w-md text-lg font-semibold"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="profile-name"
            className="text-sm font-medium text-foreground"
          >
            Nome completo
          </label>
          <p className="text-sm text-muted-foreground">
            Opcional; aparece abaixo do apelido no seu perfil.
          </p>
          <Input
            id="profile-name"
            disabled={isPending}
            value={draftName}
            onChange={(event) => onDraftNameChange(event.target.value)}
            placeholder="Fulana de tal"
            className="max-w-md"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="profile-bio"
            className="text-sm font-medium text-foreground"
          >
            Bio
          </label>
          <textarea
            id="profile-bio"
            disabled={isPending}
            value={draftBio}
            onChange={(event) => onDraftBioChange(event.target.value)}
            rows={4}
            placeholder="Conte um pouco sobre você e suas preferências literárias..."
            className="w-full max-w-2xl rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">
            Gêneros preferidos
          </p>
          <div className="flex max-w-2xl gap-2">
            <Input
              value={genreInput}
              disabled={isPending}
              onChange={(event) => onGenreInputChange(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onAddTag();
                }
              }}
              placeholder="Ex.: Ficção, Romance..."
            />
            <Button
              type="button"
              variant="secondary"
              onClick={onAddTag}
              disabled={isPending}
            >
              Adicionar
            </Button>
          </div>
          {tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => onRemoveTag(tag)}
                >
                  {tag} ✕
                </Badge>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isPending}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={onSave} disabled={isPending}>
            {isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
