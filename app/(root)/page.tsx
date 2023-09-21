import ThreadCard from "@/components/cards/ThreadCard";
import Pagination from "@/components/shared/Pagination";
import { fetchPosts } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";

export default async function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const results = await fetchPosts(
    searchParams?.page ? +searchParams.page : 1,
    5
  );
  const user = await currentUser();
  if (!user) return null;
  //TODO Implement SearchBar for Posts like for users and communities

  const userInfo = await fetchUser(user.id);
  return (
    <>
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {results.posts.length === 0 ? (
          <p className="no-result"> No threads found</p>
        ) : (
          <>
            {results.posts.map((post) => (
              <ThreadCard
                key={post._id}
                id={post._id}
                currentUserId={user?.id || ""}
                parentId={post.parentId}
                content={post.text}
                author={post.author}
                community={post.community}
                createdAt={post.createdAt}
                comments={post.children}
                liked={userInfo.liked.includes(post.id)}
              />
            ))}
          </>
        )}
      </section>
      <Pagination
        path="/"
        pageNumber={searchParams?.page ? +searchParams.page : 1}
        isNext={results.isNext}
      />
    </>
  );
}
