export interface IForgotPasswordData {
  email: string;
}

export interface IResetPasswordData {
  token: string;
  password: string;
}
