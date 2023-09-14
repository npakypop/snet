import { fetchUserPosts } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import ThreadCard from "../cards/ThreadCard";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";

interface Props {
  currentUserId: string;
  accountId: string;
  accountType: string;
}
const ThreadsTab = async ({ currentUserId, accountId, accountType }: Props) => {
  //! тут будут рисоваться посты относящиеся к определенному пользователю или сообществу

  let result: any;
  if (accountType === "Community") {
    result = await fetchCommunityPosts(accountId);
  } else {
    result = await fetchUserPosts(accountId);
  } //! в зависимости от того какого типа аккаунт будет выполняться загрузка постов пользователя или сообщества

  if (!result) redirect("/");
  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.threads.map((thread: any) => (
        <ThreadCard
          key={thread._id}
          id={thread._id}
          currentUserId={currentUserId}
          parentId={thread.parentId}
          content={thread.text}
          author={
            accountType === "User"
              ? { name: result.name, image: result.image, id: result.id }
              : {
                  name: thread.author.name,
                  image: thread.author.image,
                  id: thread.author.id,
                }
          } //! проверяется если тип аккаунта "User", то есть  это собственная страница  то тогда брать данные из одного объекта, если же это чужой профиль то с профиля на который зашел.
          community={thread.community}
          createdAt={thread.createdAt}
          comments={thread.children}
          liked={result.liked.includes(thread.id)}
        />
      ))}
    </section>
  );
};

export default ThreadsTab;
