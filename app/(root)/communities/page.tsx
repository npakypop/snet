import ProfileHeader from "@/components/shared/ProfileHeader";
import { profileTabs } from "@/constants";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs"; //! что бы определить кто именно создает сообщение
import { redirect } from "next/navigation";
import Image from "next/image";
import ThreadsTab from "@/components/shared/ThreadsTab";
import UserCard from "@/components/cards/UserCard";
import { fetchCommunities } from "@/lib/actions/community.actions";
import CommunityCard from "@/components/cards/CommunityCard";

async function Page() {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding"); //! если onboarded=фолс то тогда перенаправить на /onboarding

  //! запрос сообществ
  const results = await fetchCommunities({
    searchString: "",
    pageNumber: 1,
    pageSize: 25,
  });

  return (
    <>
      <h1 className="head-text mb-10">Search</h1>
      <div className="mt-14 flex flex-col gap-9">
        {results.communities.length === 0 ? (
          <p className="no-result"> No communities</p>
        ) : (
          <>
            {results.communities.map((community) => (
              <CommunityCard
                key={community.id}
                id={community.id}
                bio={community.bio}
                name={community.name}
                username={community.username}
                imgUrl={community.image}
                members={community.members}
              />
            ))}
          </>
        )}
      </div>
    </>
  );
}

export default Page;
