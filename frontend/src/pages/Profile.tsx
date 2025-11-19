import { useState, type ChangeEvent, useEffect } from "react";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "../api/mutations/userMutate";
import type { IApiError } from "../types/IApi";
import type { IUser, IUserUpdateForm } from "../types/IUser";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import ProfilePictureUpdate from "../components/pages/profile/ProfilePictureUpdate";
import PersonalData from "../components/pages/profile/PersonalData";
import FavoriteGenres from "../components/pages/profile/FavoriteGenres";
import ChangePassword from "../components/pages/profile/ChangePassword";

export default function Profile() {
  const { user } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>("");
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
        {/* Atualizar foto de perfil */}
        <ProfilePictureUpdate
          previewUrl={previewUrl}
          profilePictureUrl={profilePictureUrl}
          name={name}
          handleFileChange={handleFileChange}
          handleRemoveImage={handleRemoveImage}
          restRegister={restRegister}
        />
        {/* Editar dados pessoais do usuário */}
        <PersonalData register={register} />

        {/* Gêneros Favoritos */}
        <FavoriteGenres tags={tags} setTags={setTags} setValue={setValue} />

        {/* Alteração de senha */}
        <ChangePassword
          register={register}
          errors={errors}
          isChangingPassword={isChangingPassword}
          password={password}
        />

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
