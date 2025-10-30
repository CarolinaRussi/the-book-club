interface IFormInput {
  name: string;
  lastName: string;
  nickname: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface IRegisterData {
  name: string;
  lastName: string;
  nickname: string;
  email: string;
  password: string;
}

export type { IFormInput, IRegisterData };
