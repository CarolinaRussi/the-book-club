import { api } from "../index";

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export async function registerUser(data: RegisterData) {
  const response = await api.post("/register", data);
  console.log(response.data);
  return response.data;
}
