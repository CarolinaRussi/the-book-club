import { useCallback, useEffect, useState } from "react";
import type { FocusEvent, KeyboardEvent } from "react";
import { Link } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { Camera, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUser } from "@/api/mutations/userMutate";
import type { IApiError } from "@/types/IApi";
import type { IUser } from "@/types/IUser";
import ProfileHero from "@/components/pages/profile/ProfileHero";
import ProfileAvatarCropDialog from "@/components/pages/me/profile/ProfileAvatarCropDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/utils/formatters";
import { cn } from "@/lib/utils";

type EditableField = "name" | "nickname" | "bio" | "genres";

function appendGenres(formData: FormData, genres: string[]) {
  genres.forEach((tag) => formData.append("favoritesGenres", tag));
}

export default function MyProfileHero() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftNickname, setDraftNickname] = useState("");
  const [draftBio, setDraftBio] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [genreInput, setGenreInput] = useState("");

  useEffect(() => {
    if (!user) return;
    setDraftName(user.name ?? "");
    setDraftNickname(user.nickname ?? "");
    setDraftBio(user.bio ?? "");
    setTags(user.favoritesGenres ?? []);
  }, [user]);

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

  const buildFormData = useCallback(
    (extra?: (fd: FormData) => void) => {
      const formData = new FormData();
      formData.append("id", user!.id);
      extra?.(formData);
      return formData;
    },
    [user],
  );

  const saveTextField = useCallback(
    (field: "name" | "nickname" | "bio", value: string) => {
      if (!user) return;
      const trimmed = value.trim();
      const current =
        field === "name"
          ? user.name
          : field === "nickname"
            ? user.nickname
            : user.bio;
      if (trimmed === (current ?? "")) {
        setEditingField(null);
        return;
      }
      if (field !== "bio" && !trimmed) {
        toast.error("Este campo não pode ficar vazio.");
        return;
      }
      const formData = buildFormData((fd) => fd.append(field, trimmed));
      saveProfile(formData, {
        onSuccess: () => setEditingField(null),
      });
    },
    [user, buildFormData, saveProfile],
  );

  const saveGenres = useCallback(
    (nextTags: string[]) => {
      if (!user) return;
      const formData = buildFormData((fd) => appendGenres(fd, nextTags));
      saveProfile(formData);
    },
    [user, buildFormData, saveProfile],
  );

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
    if (!user) return;
    const formData = buildFormData((fd) => {
      fd.append("profile_picture", file);
    });
    setPreviewUrl((prev) => {
      if (prev?.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    saveProfile(formData);
  };

  const handleBlurSave = (
    field: "name" | "nickname" | "bio",
    value: string,
  ) => {
    saveTextField(field, value);
  };

  const handleKeyDownSave = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: "name" | "nickname" | "bio",
    value: string,
  ) => {
    if (e.key === "Enter" && field !== "bio") {
      e.preventDefault();
      saveTextField(field, value);
    }
    if (e.key === "Escape") {
      if (!user) return;
      if (field === "name") setDraftName(user.name ?? "");
      if (field === "nickname") setDraftNickname(user.nickname ?? "");
      if (field === "bio") setDraftBio(user.bio ?? "");
      setEditingField(null);
    }
  };

  const addTag = () => {
    const trimmed = genreInput.trim();
    if (!trimmed || tags.includes(trimmed)) return;
    const next = [...tags, trimmed];
    setTags(next);
    setGenreInput("");
    saveGenres(next);
  };

  const removeTag = (tag: string) => {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    saveGenres(next);
  };

  if (!user) return null;

  const displayPicture = previewUrl || user.profilePicture;
  const editableHint = "cursor-pointer rounded-md transition-colors hover:bg-secondary/40";

  return (
    <>
      <ProfileHero
        actionsSlot={
          <Link
            to="/me/account"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            aria-label="Conta e configurações"
          >
            <Settings className="h-5 w-5" />
            <span className="hidden sm:inline">Conta</span>
          </Link>
        }
        avatarSlot={
          <label className="group relative block cursor-pointer">
            <Avatar className="size-28 shrink-0 sm:size-32 md:size-36">
              <AvatarImage src={displayPicture || undefined} alt={user.name} />
              <AvatarFallback className="text-3xl text-primary" delayMs={600}>
                {getInitials(user.name || "")}
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
        }
        nicknameSlot={
          editingField === "nickname" ? (
            <input
              autoFocus
              disabled={isPending}
              value={draftNickname}
              onChange={(e) => setDraftNickname(e.target.value)}
              onBlur={() => handleBlurSave("nickname", draftNickname)}
              onKeyDown={(e) => handleKeyDownSave(e, "nickname", draftNickname)}
              className="min-w-32 max-w-md rounded-md border border-secondary bg-background px-2 py-1 text-2xl font-bold text-foreground sm:text-3xl"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingField("nickname")}
              className={cn(
                "block text-left text-2xl font-bold text-foreground sm:text-3xl",
                editableHint,
                "px-2 py-1",
              )}
            >
              {user.nickname || "Apelido"}
            </button>
          )
        }
        nameSlot={
          editingField === "name" ? (
            <input
              autoFocus
              disabled={isPending}
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              onBlur={() => handleBlurSave("name", draftName)}
              onKeyDown={(e) => handleKeyDownSave(e, "name", draftName)}
              className="min-w-32 max-w-md rounded-md border border-secondary bg-background px-2 py-1 text-base text-muted-foreground sm:text-lg"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingField("name")}
              className={cn(
                "block text-left text-base text-muted-foreground sm:text-lg",
                editableHint,
                "px-2 py-1",
              )}
            >
              {user.name || "Adicionar nome completo"}
            </button>
          )
        }
        bioSlot={
          editingField === "bio" ? (
            <textarea
              autoFocus
              disabled={isPending}
              value={draftBio}
              onChange={(e) => setDraftBio(e.target.value)}
              onBlur={(e: FocusEvent<HTMLTextAreaElement>) =>
                handleBlurSave("bio", e.target.value)
              }
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setDraftBio(user.bio ?? "");
                  setEditingField(null);
                }
              }}
              rows={4}
              placeholder="Conte um pouco sobre você e suas preferências literárias..."
              className="w-full max-w-2xl rounded-md border border-secondary bg-background px-3 py-2 text-base text-foreground"
            />
          ) : (
            <button
              type="button"
              onClick={() => setEditingField("bio")}
              className={cn(
                "block max-w-2xl text-left text-base leading-relaxed",
                user.bio ? "text-muted-foreground" : "text-muted-foreground/70 italic",
                editableHint,
                "px-2 py-1 whitespace-pre-wrap",
              )}
            >
              {user.bio?.trim() ||
                "Clique para adicionar uma bio — é o que outros leitores verão."}
            </button>
          )
        }
        genresSlot={
          editingField === "genres" ? (
            <div className="space-y-2 rounded-lg border border-secondary/60 bg-card/30 p-3">
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={genreInput}
                  onChange={(e) => setGenreInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                    if (e.key === "Escape") {
                      setTags(user.favoritesGenres ?? []);
                      setEditingField(null);
                    }
                  }}
                  placeholder="Ex.: Ficção, Romance..."
                  className="flex-1 rounded-md border border-secondary bg-background px-2 py-1.5 text-sm"
                />
                <button
                  type="button"
                  onClick={addTag}
                  disabled={isPending}
                  className="rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground cursor-pointer disabled:opacity-50"
                >
                  Adicionar
                </button>
              </div>
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
              <button
                type="button"
                onClick={() => setEditingField(null)}
                className="text-sm text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Fechar
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingField("genres")}
              className={cn("block w-full text-left", editableHint, "py-1")}
            >
              {tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {tags.map((genre) => (
                    <Badge key={genre} variant="secondary">
                      {genre}
                    </Badge>
                  ))}
                </div>
              ) : (
                <span className="text-sm text-muted-foreground/70 italic">
                  Clique para adicionar
                </span>
              )}
            </button>
          )
        }
      />

      <ProfileAvatarCropDialog
        open={!!cropImageSrc}
        imageSrc={cropImageSrc}
        onOpenChange={handleCropDialogOpenChange}
        onCropComplete={handleCroppedAvatar}
      />
    </>
  );
}
