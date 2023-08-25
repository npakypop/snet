import ProfileHeader from "@/components/shared/ProfileHeader";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs"; //! что бы определить кто именно создает сообщение
import { redirect } from "next/navigation";

async function Page({ params }: { params: { id: string } }) {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  console.log("params: ", params);
  const userInfo = await fetchUser(params.id); //! достаем айди из строки запроса

  if (!userInfo?.onboarded) redirect("/onboarding"); //! если onboarded=фолс то тогда перенаправить на /onboarding

  return (
    <section>
      <ProfileHeader
        accounId={userInfo.id} //! айди юзера на профайл которого смотрим
        authUserId={user.id} //! это позволит нам понять что текущий зарегестрированый пользоватьель смотрит на свой собственный профиль или на чейто другой
        name={userInfo.name}
        username={userInfo.username}
        imgUrl={userInfo.image}
        bio={userInfo.bio}
      />
      <div className="mt-9 "></div>
    </section>
  );
}

export default Page;
