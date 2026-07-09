import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUser } from "@/api/mutations/userMutate";
import type { IApiError } from "@/types/IApi";
import type { IUser } from "@/types/IUser";
import ProfileHero from "@/components/pages/profile/ProfileHero";
import ProfileAvatarCropDialog from "@/components/pages/me/profile/ProfileAvatarCropDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInitials } from "@/utils/formatters";

function appendGenres(formData: FormData, genres: string[]) {
  if (genres.length === 0) {
    formData.append("favoritesGenres", "");
    return;
  }
  genres.forEach((tag) => formData.append("favoritesGenres", tag));
}

function genresEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  return a.every((tag, index) => tag === b[index]);
}

export default function MyProfileHero() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
  const [removeProfilePicture, setRemoveProfilePicture] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftNickname, setDraftNickname] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState("");

  const resetDraftsFromUser = useCallback(() => {
    if (!user) return;
    setDraftName(user.name ?? "");
    setDraftNickname(user.nickname ?? "");
    setDraftBio(user.bio ?? "");
    setTags(user.favoritesGenres ?? []);
    setGenreInput("");
    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return undefined;
    });
    setPendingAvatarFile(null);
    setRemoveProfilePicture(false);
  }, [user]);

  useEffect(() => {
    if (!user || isEditing) return;
    resetDraftsFromUser();
  }, [user, isEditing, resetDraftsFromUser]);

  const isDirty = useCallback(() => {
    if (!user) return false;
    return (
      draftNickname.trim() !== (user.nickname ?? "") ||
      draftName.trim() !== (user.name ?? "") ||
      draftBio.trim() !== (user.bio ?? "") ||
      !genresEqual(tags, user.favoritesGenres ?? []) ||
      pendingAvatarFile !== null ||
      removeProfilePicture
    );
  }, [
    user,
    draftNickname,
    draftName,
    draftBio,
    tags,
    pendingAvatarFile,
    removeProfilePicture,
  ]);

  const { mutate: saveProfile, isPending } = useMutation<
    IUser,
    IApiError,
    FormData
  >({
    mutationFn: updateUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["authenticatedUser"] });
      await queryClient.invalidateQueries({ queryKey: ["readers"] });
      toast.success("Perfil atualizado!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar o perfil");
    },
  });

  const handleStartEditing = () => {
    resetDraftsFromUser();
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    if (isDirty()) {
      setDiscardConfirmOpen(true);
      return;
    }
    setIsEditing(false);
    resetDraftsFromUser();
  };

  const handleConfirmDiscard = () => {
    setDiscardConfirmOpen(false);
    setIsEditing(false);
    resetDraftsFromUser();
  };

  const handleSave = () => {
    if (!user) return;

    const trimmedNickname = draftNickname.trim();
    if (!trimmedNickname) {
      toast.error("Apelido não pode ficar vazio.");
      return;
    }

    const formData = new FormData();
    formData.append("id", user.id);
    formData.append("name", draftName.trim());
    formData.append("nickname", trimmedNickname);
    formData.append("bio", draftBio.trim());
    appendGenres(formData, tags);

    if (pendingAvatarFile) {
      formData.append("profile_picture", pendingAvatarFile);
    }
    if (removeProfilePicture) {
      formData.append("removeProfilePicture", "true");
    }

    saveProfile(formData, {
      onSuccess: () => {
        setIsEditing(false);
        setPendingAvatarFile(null);
        setRemoveProfilePicture(false);
        setPreviewUrl(undefined);
      },
    });
  };

  const handlePickImageFile = (file: File) => {
    setCropImageSrc(URL.createObjectURL(file));
  };

  const handleCropDialogOpenChange = (open: boolean) => {
    if (!open && cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
      setCropImageSrc(null);
    }
  };

  const handleCroppedAvatar = (file: File) => {
    setPendingAvatarFile(file);
    setRemoveProfilePicture(false);
    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleRemoveImage = () => {
    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return undefined;
    });
    setPendingAvatarFile(null);
    setRemoveProfilePicture(true);
  };

  const addTag = () => {
    const trimmed = genreInput.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags((prev) => [...prev, trimmed]);
    setGenreInput("");
  };

  const removeTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  if (!user) return null;

  const displayPicture = removeProfilePicture
    ? undefined
    : previewUrl || user.profilePicture;

  const actionsSlot = (
    <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
      <Button type="button" size="sm" onClick={handleStartEditing}>
        Editar perfil
      </Button>
      <Link
        to="/me/account"
        title="Senha e configurações"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        Conta
      </Link>
    </div>
  );

  if (!isEditing) {
    return (
      <ProfileHero
        name={user.name}
        nickname={user.nickname}
        bio={user.bio}
        profilePicture={user.profilePicture}
        favoritesGenres={user.favoritesGenres ?? []}
        actionsSlot={actionsSlot}
      />
    );
  }

  return (
    <>
      <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="flex flex-col items-center gap-2">
          <label className="group relative block cursor-pointer">
            <Avatar className="size-28 shrink-0 sm:size-32 md:size-36">
              <AvatarImage
                src={displayPicture || undefined}
                alt={draftNickname || user.name}
              />
              <AvatarFallback className="text-3xl text-primary" delayMs={600}>
                {getInitials(draftNickname || user.name || "")}
              </AvatarFallback>
            </Avatar>
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-background/60 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-8 w-8 text-foreground" />
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = "";
                if (file) handlePickImageFile(file);
              }}
            />
          </label>
          {displayPicture ? (
            <button
              type="button"
              onClick={handleRemoveImage}
              className="text-sm text-primary hover:underline cursor-pointer"
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
              onChange={(e) => setDraftNickname(e.target.value)}
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
              onChange={(e) => setDraftName(e.target.value)}
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
              onChange={(e) => setDraftBio(e.target.value)}
              rows={4}
              placeholder="Conte um pouco sobre você e suas preferências literárias..."
              className="w-full max-w-2xl rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:opacity-50"
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
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Ex.: Ficção, Romance..."
              />
              <Button
                type="button"
                variant="secondary"
                onClick={addTag}
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
                    onClick={() => removeTag(tag)}
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
              onClick={handleCancelEditing}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleSave} disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </div>
      </div>

      <ProfileAvatarCropDialog
        open={!!cropImageSrc}
        imageSrc={cropImageSrc}
        onOpenChange={handleCropDialogOpenChange}
        onCropComplete={handleCroppedAvatar}
      />

      <AlertDialog open={discardConfirmOpen} onOpenChange={setDiscardConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              As mudanças que você fez no perfil ainda não foram salvas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar editando</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDiscard}>
              Descartar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
