interface IFormInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export type { IFormInput, RegisterData };