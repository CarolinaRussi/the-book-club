interface IFormInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface IRegisterData {
  name: string;
  email: string;
  password: string;
}

export type { IFormInput, IRegisterData };