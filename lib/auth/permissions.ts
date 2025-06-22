import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  userAc,
} from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
  // Permissions pour la gestion des événements (lecture accessible à tous)
  event: [
    "create", // Créer un événement
    "update", // Modifier un événement
    "delete", // Supprimer un événement
    "override", // Modifier un événement si on est pas le créateur
  ],
  room: [
    "create", // Créer une salle
    "update", // Modifier une salle
    "delete", // Supprimer une salle
    "assign", // Assigner une salle à un événement
  ],
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  ...adminAc.statements,
  event: ["create", "update", "delete", "override"],
  room: ["create", "update", "delete", "assign"],
});

export const user = ac.newRole({
  ...userAc.statements,
});

export const organizer = ac.newRole({
  ...userAc.statements,
  event: ["create", "update", "delete"],
  room: ["assign"],
});
