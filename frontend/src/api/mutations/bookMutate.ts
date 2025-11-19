import axios from "axios";
import { api } from "../index";
import type { IBookPayload, IBookReviewPayload } from "../../types/IBooks";

export async function createBook(data: IBookPayload): Promise<any> {
  try {
    const formData = new FormData();

    if (data.coverImg && data.coverImg.length > 0) {
      const file = data.coverImg[0];
      formData.append("coverImg", file);
    }

    formData.append("id", data.id || "");
    formData.append("cover_url_open_library", data.coverUrlOpenLibrary || "");
    formData.append("title", data.title);
    formData.append("author", data.author);
    formData.append("club_id", data.clubId);

    const response = await api.post("/create-book", formData);

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro desconhecido ao criar o livro" };
  }
}

export async function saveReview(data: IBookReviewPayload): Promise<any> {
  try {
    const response = await api.post("/save-review", data);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro desconhecido" };
  }
}
