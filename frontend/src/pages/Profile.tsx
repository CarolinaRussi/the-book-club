import { useState, type ChangeEvent, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { getInitials } from "../utils/formatters";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "../api/mutations/userMutate";
import type { IApiError } from "../types/IApi";
import type { IUser, IUserUpdateForm } from "../types/IUser";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>("");
  const [inputValue, setInputValue] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    resetField,
  } = useForm<IUserUpdateForm>();

  useEffect(() => {
    if (user) {
      setValue("id", user.id);
      setValue("name", user.name);
      setValue("nickname", user.nickname);
      setValue("email", user.email);
      setValue("bio", user.bio);
      setValue("profile_picture_url", user.profile_picture);

      const userTags = user.favorites_genres ? user.favorites_genres : [];
      setTags(userTags);
      setValue("tags", userTags);
    }
  }, [user, setValue]);

  const name = watch("name");
  const profilePictureUrl = watch("profile_picture_url");
  const password = watch("password");
  const isChangingPassword =
    !!watch("oldPassword") || !!watch("password") || !!watch("confirmPassword");

  const { onChange: rhfOnChange, ...restRegister } =
    register("profile_picture");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    rhfOnChange(event);
    const file = event.target.files?.[0];
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
      setValue("remove_profile_picture", false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    setValue("profile_picture_url", "");
    resetField("profile_picture");
    setValue("remove_profile_picture", true);
  };

  const addTag = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed];
      setTags(newTags);
      setValue("tags", newTags);
      setInputValue("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const newTags = tags.filter((tag) => tag !== tagToRemove);
    setTags(newTags);
    setValue("tags", newTags);
  };

  const { mutate: updateUserMutate, isPending } = useMutation<
    IUser,
    IApiError,
    FormData
  >({
    mutationFn: updateUser,
    onSuccess: async () => {
      queryClient.invalidateQueries({
        queryKey: ["authenticatedUser"],
      });
      toast.success("Perfil atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar o perfil");
    },
  });

  const onSubmit: SubmitHandler<IUserUpdateForm> = (data) => {
    const formData = new FormData();

    const file = data.profile_picture?.[0];
    if (file) {
      formData.append("profile_picture", file);
    }

    if (data.tags && data.tags.length > 0) {
      data.tags.forEach((tag) => {
        formData.append("favorites_genres", tag);
      });
    }

    formData.append("id", data.id);
    formData.append("name", data.name ?? "");
    formData.append("nickname", data.nickname ?? "");
    formData.append("email", data.email ?? "");
    formData.append("bio", data.bio ?? "");

    if (isChangingPassword) {
      formData.append("oldPassword", data.oldPassword ?? "");
      formData.append("password", data.password ?? "");
    }
    updateUserMutate(formData);
  };

  return (
    <div className="flex flex-col w-full max-w-7xl p-5 md:p-20">
      <div className="flex flex-col items-start">
        <h1 className="text-4xl font-bold text-foreground ">Meu Perfil</h1>
      </div>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-2xl">Foto de Perfil</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="justify-items-center">
              <Avatar className="mb-4 size-30 md:size-40 lg:size-50">
                <AvatarImage
                  src={previewUrl || profilePictureUrl || undefined}
                  alt="Foto de perfil"
                />
                <AvatarFallback className="text-4xl text-primary" delayMs={600}>
                  {getInitials(name || "")}
                </AvatarFallback>
              </Avatar>
            </div>

            <label
              htmlFor="avatarInput"
              className="mt-4 inline-flex items-center justify-center w-full rounded-md text-sm bg-secondary text-secondary-foreground hover:bg-primary hover:text-background h-10 px-4 py-2 cursor-pointer"
            >
              Atualizar imagem
            </label>

            <input
              type="file"
              id="avatarInput"
              accept="image/png, image/jpeg, image/webp"
              {...restRegister}
              onChange={handleFileChange}
              hidden={true}
            />
            <button
              type="button"
              onClick={handleRemoveImage}
              className="mt-4 inline-flex items-center justify-center w-full text-sm text-primary hover:underline cursor-pointer"
            >
              Remover foto
            </button>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-2xl">Informações Pessoais</CardTitle>
            <CardDescription>Atualize seus dados pessoais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-2 text-start">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 w-full">
                <div className="flex flex-col gap-y-2">
                  <div>Nome Completo:</div>
                  <input
                    {...register("name")}
                    placeholder="Fulana de tal"
                    className="border-2 border-secondary rounded-lg p-2 w-full text-foreground bg-background"
                  />
                </div>
                <div className="flex flex-col gap-y-2">
                  <div>Apelido</div>
                  <input
                    {...register("nickname")}
                    placeholder="Como prefere ser chamado?"
                    className="border-2 border-secondary rounded-lg p-2 w-full text-foreground bg-background"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 w-full">
                <div>E-mail:</div>
                <input
                  {...register("email")}
                  placeholder="fulaninha@email.com"
                  className="border-2 border-secondary rounded-lg p-2 w-full text-foreground bg-background"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 w-full">
                <div>Biografia:</div>
                <textarea
                  {...register("bio")}
                  placeholder="Conte um pouco sobre você e suas preferências literárias..."
                  className="border-2 border-secondary rounded-lg p-2 w-full min-h-30 text-foreground bg-background"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-2xl">Gêneros Favoritos</CardTitle>
            <CardDescription>
              Adicione os gêneros literários que você mais gosta
            </CardDescription>
            <CardContent className="p-0">
              <div className="flex gap-2 w-full">
                <input
                  className="border-2 border-secondary rounded-lg p-2 w-full text-foreground bg-background"
                  placeholder="Ex.: Ficção Científica, Romance..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <button
                  type="button"
                  className="bg-primary text-background font-semibold rounded-lg p-2 w-30 cursor-pointer"
                  onClick={addTag}
                >
                  Adicionar
                </button>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="default"
                    className="cursor-pointer p-2"
                    onClick={() => removeTag(tag)}
                  >
                    {tag} ✕
                  </Badge>
                ))}
              </div>
            </CardContent>
          </CardHeader>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Alterar Senha</CardTitle>
            <CardDescription>
              Deixe em branco se não quiser alterar
            </CardDescription>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="flex flex-col gap-2 w-full">
                  <div>Senha atual:</div>
                  <input
                    type="password"
                    {...register("oldPassword", {
                      required: isChangingPassword
                        ? "Senha atual é obrigatória"
                        : false,
                    })}
                    autoComplete="new-password"
                    className="border-2 border-secondary rounded-lg p-2 w-full text-foreground bg-background"
                  />
                  {errors.oldPassword && (
                    <h3 className="text-xs text-primary">
                      {errors.oldPassword.message}
                    </h3>
                  )}
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <div>Nova Senha:</div>
                  <input
                    type="password"
                    {...register("password", {
                      required: isChangingPassword
                        ? "Nova senha é obrigatória"
                        : false,
                    })}
                    className="border-2 border-secondary rounded-lg p-2 w-full text-foreground bg-background"
                  />
                  {errors.password && (
                    <h3 className="text-xs text-primary">
                      {errors.password.message}
                    </h3>
                  )}
                </div>
                <div className="flex flex-col gap-2 w-full">
                  <div>Confirmar Nova Senha:</div>
                  <input
                    type="password"
                    {...register("confirmPassword", {
                      required: isChangingPassword
                        ? "Confirmação é obrigatória"
                        : false,
                      validate: (value) =>
                        !isChangingPassword ||
                        value === password ||
                        "As senhas não coincidem",
                    })}
                    className="border-2 border-secondary rounded-lg p-2 w-full text-foreground bg-background"
                  />
                  {errors.confirmPassword && (
                    <h3 className="text-xs text-primary">
                      {errors.confirmPassword.message}
                    </h3>
                  )}
                </div>
              </div>
            </CardContent>
          </CardHeader>
        </Card>

        <div className="md:col-span-3 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-md text-sm font-semibold h-10 px-4 py-2 bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed"
          >
            {isPending ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
