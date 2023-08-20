import AccountProfile from "@/components/forms/AccountProfile";
import { currentUser } from "@clerk/nextjs";

async function Page() {
  const user = await currentUser(); //! информация о пользователе приходит из клерка после регистрации

  const userInfo = {};

  const userData = {
    id: user?.id, //! айди полдключившегося пользователя
    objectId: userInfo?._id, //! тоже должен приходить из БД, и для єтого віше создан еще один обїект с информацией которую будемт запрашивать из БД
    username: userInfo?.username || user?.username,
    name: userInfo?.name || user?.firstName || "", //! имя будет приходить или из базі данніх или из КЛерка если пользователь там указал свое имя или же постая строка еслм не указал ничего
    bio: userInfo?.bio || "",
    image: userInfo?.image || user?.imageUrl,
  }; //!перед тем как передать информацию в компонент AccountProfile надо создать обїект с информацией о пользователе

  return (
    <main className="mx-auto flex max-w-2xl flex-col justify-start px-10 py-20">
      <h1 className="head-text">Onboarding</h1>
      <p className="mt-3 text-base-regular text-light-2">
        Complite your profile to use Threads
      </p>
      <section className="mt-9 bg-dark-2 p-10">
        <AccountProfile user={userData} btnTitle="Continue" />
      </section>
    </main>
  );
}

export default Page;
