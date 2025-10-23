/**
 * Login Models
 * Evidence: /angularjs2/controllers/login.js:27-41, /angularjs2/definitions/passport.js:38-80
 * POST /login/ expects { success: true } or [{ error: '...' }]
 * Errors: "Unknown user" and "Invalid password"
 */

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginSuccessResponse {
  success: true;
}

export interface LoginErrorResponse {
  error: string;
}

export type LoginResponse = LoginSuccessResponse | LoginErrorResponse[];
