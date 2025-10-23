/**
 * User Model
 * Evidence: /angularjs2/models/users.js
 * Fields: username, email, password, admin, rights, right_menu, entity, isEnable, lastConnection
 */

export interface UserRights {
  [resource: string]: {
    [permission: string]: boolean;
  };
}

export interface User {
  _id: string;
  username: string;
  email: string;
  admin: boolean;
  rights: UserRights;
  right_menu: boolean;
  entity?: string;
  isEnable: boolean;
  lastConnection?: Date;
  firstname?: string;
  lastname?: string;
}
