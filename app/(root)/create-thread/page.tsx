import PostThread from "@/components/forms/PostThread";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs";//! что бы определить кто именно создает сообщение
import { redirect } from "next/navigation";

async function Page() {
  const user = await currentUser();
  if (!user) {
    return null;
  }

  const userInfo = await fetchUser(user.id);//! если пользователь есть то запрашиваем информацию о нем из БД

  if (!userInfo?.onboarded)redirect("/onboarding");//! если onboarded=фолс то тогда перенаправить на /onboarding

  return (
    <>
      <h1 className="head-text">Create Thread</h1>
      <PostThread userId={userInfo._id} />
    </>
  );
}
export default Page;
