import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs"; //! что бы определить кто именно создает сообщение
import { redirect } from "next/navigation";
import { fetchCommunities } from "@/lib/actions/community.actions";
import CommunityCard from "@/components/cards/CommunityCard";
import Pagination from "@/components/shared/Pagination";
import SearchBar from "@/components/shared/SearchBar";

async function Page({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding"); //! если onboarded=фолс то тогда перенаправить на /onboarding

  //! запрос сообществ
  const results = await fetchCommunities({
    searchString: searchParams.q,
    pageNumber: searchParams?.page ? +searchParams.page : 1,
    pageSize: 1,
  });

  return (
    <>
      <h1 className="head-text mb-10">Search</h1>

      <div className="mt-5">
        <SearchBar routeType="communities" />
      </div>

      <section className="mt-9 flex flex-wrap gap-4">
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
      </section>

      <Pagination
        path="communities"
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={results.isNext}
      />
    </>
  );
}

export default Page;
