import FormRoomsManagement from "@/components/administration/forms/form-rooms-management";
import { redirect } from "next/navigation";
import { getUser } from "@/server/util/getUser";
import { Role } from "@prisma/client";

export default async function Admin() {
  const user = await getUser();

  const isAdmin = user?.role === Role.admin;

  if (!isAdmin) {
    redirect("/forbidden");
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-h-screen">
      <div className="flex flex-col xl:flex-row justify-center gap-4 sm:gap-6 lg:gap-8 max-w-4xl xl:max-w-7xl mx-auto">
        <div className="w-full xl:w-1/2">
          <FormRoomsManagement />
        </div>
      </div>
    </div>
  );
}
