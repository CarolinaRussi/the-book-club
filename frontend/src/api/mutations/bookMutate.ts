import axios from "axios";
import { api } from "../index";
import { IBookPayload } from "../../types/IBooks";

export async function createBook(data: IBookPayload): Promise<any> {
  try {
    const formData = new FormData();

    if (data.coverImg && data.coverImg.length > 0) {
      const file = data.coverImg[0];
      formData.append("coverImg", file);
    }

    if (data.openLibraryId && data.coverUrl) {
      formData.append("open_library_id", data.openLibraryId);
      formData.append("cover_url", data.coverUrl);
    }

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
