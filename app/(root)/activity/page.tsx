import Pagination from "@/components/shared/Pagination";
import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs"; //! что бы определить кто именно создает сообщение
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

async function Page() {
  const user = await currentUser();
  if (!user) {
    return null;
  }
  const userInfo = await fetchUser(user.id);

  if (!userInfo?.onboarded) redirect("/onboarding");

  // const [replies, likesReplies] = await getActivity(userInfo._id);
  // console.log("Page ~ likesReplies:", likesReplies);
  // console.log("Page ~ replies:", replies);
  const replies = await getActivity(userInfo._id);
  console.log("replies:", replies);

  return (
    <section>
      <h1 className="head-text mb-10">Activity</h1>
      <section className="mt-10 flex flex-col gap-5">
        hello
        {replies.length > 0 ? (
          <>
            {replies.map((act) => (
              <Link key={act._id} href={`/thread/${act.parentId}`}>
                <article className="activity-card">
                  <Image
                    src={act.author.image}
                    alt="image"
                    width={20}
                    height={20}
                    className="rounded-full object-cover"
                  />
                  <p className="!text-small-regular text-light-1">
                    <span className="mr-1 text-primary-500">
                      {act.author.name}
                    </span>{" "}
                    replied to your thread
                  </p>
                </article>
              </Link>
            ))}
          </>
        ) : (
          <p className="!text-base-regular text-light-3">No activity yet</p>
        )}
      </section>
    </section>
  );
}

export default Page;
