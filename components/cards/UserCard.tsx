"use client";
import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  personType: string;
}
const UserCard = ({ id, name, username, imgUrl, personType }: Props) => {
  const router = useRouter();
  return (
    <article className="user-card">
      <div className="user-card_avatar">
        <Image
          src={imgUrl}
          alt="Profil photo"
          width={48}
          height={48}
          className="rounded-full"
        />
        <div className="flex-1 text-ellipsis">
          {/* text-ellipsis стиль, который позволяет создать текстовый элемент,
          у которого длинный текст будет усечен с помощью многоточия, если он не
                  помещается в определенной ширине. */}
          <h4 className=" text-base-semibold text-light-1">{name}</h4>
          <p className="text-small-medium text-gray-1">@{username}</p>
        </div>
      </div>
      <Button
        className="user-card_btn"
        onClick={() => router.push(`/profile/${id}`)} //! перекинет на профиль пользователя
      >
        View
      </Button>
    </article>
  );
};

export default UserCard;
