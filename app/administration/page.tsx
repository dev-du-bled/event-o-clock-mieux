import FormMoviesManagement from "@/components/events/forms/form-movies-management";
import NotFound from "../not-found";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { Role } from "@prisma/client";

export default async function Admin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;
  const isAdmin = user?.role == Role.admin;

  if (!user || !isAdmin) {
    return <NotFound />;
  }

  return (
    <div className="flex justify-center flex-1 gap-8 p-8 ">
      <FormMoviesManagement />
    </div>
  );
}
