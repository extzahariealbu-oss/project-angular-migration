/**
 * Session Model
 * Evidence: /angularjs2/controllers/login.js:27-41
 * POST /session/ returns { user: {...}, config: { version: '...' } }
 */

import { User } from './user.model';

export interface AppConfig {
  version: string;
}

export interface SessionResponse {
  user: User;
  config: AppConfig;
}
