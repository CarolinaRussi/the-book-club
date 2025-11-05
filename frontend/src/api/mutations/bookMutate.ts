import axios from "axios";
import { api } from "../index";
import { IBookPayload } from "../../types/IBooks";

export async function createBook(data: IBookPayload): Promise<any> {
  try {
    if (data.coverImg) {
      console.log("entrou no formData");
      const formData = new FormData();
      const file = data.coverImg;

      formData.append("title", data.title);
      formData.append("author", data.author);
      formData.append("coverImg", file);

      const response = await api.post("/create-book-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } else {
      const response = await api.post("/create-book-url", data);
      return response.data;
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      throw { message: error.response.data.message };
    }
    throw { message: "Erro desconhecido" };
  }
}
