import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  // Permissions pour la gestion des événements (lecture accessible à tous)
  event: ["create", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  ...adminAc.statements,
  event: ["create", "update", "delete"],
});

export const user = ac.newRole({
  ...userAc.statements,
});

export const organizer = ac.newRole({
  ...userAc.statements,
  event: ["create", "update", "delete"],
});
