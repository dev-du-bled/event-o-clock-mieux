import FormMoviesManagement from "@/components/administration/forms/form-movies-management";
import FormRoomsManagement from "@/components/administration/forms/form-rooms-management";
import NotFound from "../not-found";
import { auth } from "@/lib/auth/auth";
import { headers } from "next/headers";
import { Role } from "@prisma/client";
import NotAuthorized from "@/components/auth/not-authorized";

export default async function Admin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user;
  const isAdmin = user?.role === Role.admin;

  if (!isAdmin) {
    return <NotAuthorized />;
  } else if (!user) {
    return <NotFound />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="flex flex-col xl:flex-row justify-center gap-4 sm:gap-6 lg:gap-8 max-w-4xl xl:max-w-7xl mx-auto">
        <div className="w-full xl:w-1/2">
          <FormMoviesManagement />
        </div>
        <div className="w-full xl:w-1/2">
          <FormRoomsManagement />
        </div>
      </div>
    </div>
  );
}
