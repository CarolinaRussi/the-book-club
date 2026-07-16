import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import { updateUser } from "@/api/mutations/userMutate";
import type { IApiError } from "@/types/IApi";
import type { IUser } from "@/types/IUser";
import ProfileHero from "@/components/pages/profile/ProfileHero";
import { MyProfileEditForm } from "@/components/pages/me/MyProfileEditForm";
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
import { Button } from "@/components/ui/button";

function appendGenres(formData: FormData, genres: string[]) {
  if (genres.length === 0) {
    formData.append("favoritesGenres", "");
    return;
  }
  genres.forEach((tag) => formData.append("favoritesGenres", tag));
}

function genresEqual(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  return left.every((tag, index) => tag === right[index]);
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
    setPreviewUrl((previous) => {
      if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
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
    setPreviewUrl((previous) => {
      if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
      return URL.createObjectURL(file);
    });
  };

  const handleRemoveImage = () => {
    setPreviewUrl((previous) => {
      if (previous?.startsWith("blob:")) URL.revokeObjectURL(previous);
      return undefined;
    });
    setPendingAvatarFile(null);
    setRemoveProfilePicture(true);
  };

  const addTag = () => {
    const trimmed = genreInput.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    setTags((previous) => [...previous, trimmed]);
    setGenreInput("");
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
      <MyProfileEditForm
        isPending={isPending}
        displayPicture={displayPicture}
        draftName={draftName}
        draftNickname={draftNickname}
        draftBio={draftBio}
        tags={tags}
        genreInput={genreInput}
        onDraftNameChange={setDraftName}
        onDraftNicknameChange={setDraftNickname}
        onDraftBioChange={setDraftBio}
        onGenreInputChange={setGenreInput}
        onAddTag={addTag}
        onRemoveTag={(tag) =>
          setTags((previous) => previous.filter((item) => item !== tag))
        }
        onPickImageFile={handlePickImageFile}
        onRemoveImage={handleRemoveImage}
        onCancel={handleCancelEditing}
        onSave={handleSave}
      />

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
