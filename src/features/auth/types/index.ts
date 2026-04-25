export interface User {
  id: string;
  email: string;
  role: "entrepreneur" | "manufacturer" | "mentor" | "supplier" | "admin";
  full_name?: string;
  is_active?: boolean;
  is_verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SignupData {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface OtpData {
  email: string;
  otp_code: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  email: string;
  otp_code: string;
  new_password: string;
  confirm_password: string;
}

export interface QuestionnaireAnswer {
  field: string;
  value: string | string[];
}