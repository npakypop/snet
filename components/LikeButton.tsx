"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Heart from "public/assets/heart-gray.svg";
import HeartRed from "public/assets/heart-filled.svg";
import { addToLiked, removeFromLiked } from "@/lib/actions/user.actions";

interface Props {
  id: string;
  currentUserId: string;
  liked: boolean;
}

const LikeButton: React.FC<Props> = ({ id, currentUserId, liked }) => {
  const pathname = usePathname();
  const handleLike = () => {
    // console.log(`liked ${liked} ${id}`);
    liked
      ? removeFromLiked(id, currentUserId, pathname)
      : addToLiked(id, currentUserId, pathname);
  };

  return (
    <div onClick={handleLike}>
      <Image
        src={liked ? HeartRed : Heart}
        alt="like"
        width={24}
        height={24}
        className={`cursor-pointer object-contain stroke-lime-900`}
      />
    </div>
  );
};
export default LikeButton;
