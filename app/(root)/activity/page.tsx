import ProfileHeader from "@/components/shared/ProfileHeader";
import { profileTabs } from "@/constants";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs"; //! что бы определить кто именно создает сообщение
import { redirect } from "next/navigation";
import Image from "next/image";
import ThreadsTab from "@/components/shared/ThreadsTab";
import UserCard from "@/components/cards/UserCard";

async function Page() {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding");
  return <h1 className="head-text mb-10">Activity</h1>;
}

export default Page;
