"use client";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import Heart from "public/assets/heart-gray.svg";
import HeartRed from "public/assets/heart-filled.svg";
import { addToLiked, removeFromLiked } from "@/lib/actions/thread.actions";
interface Props {
  name: string;
  id: string;
  currentUserId: string;
  liked: boolean;
}

const LikeButton: React.FC<Props> = ({ name, id, currentUserId, liked }) => {
  const [like, setLike] = useState(liked);

  const handleLike = () => {
    // console.log(`liked ${liked} ${id}`);
    like ? removeFromLiked(id, currentUserId) : addToLiked(id, currentUserId);
    setLike(!like);
  };
  return (
    <div onClick={handleLike}>
      <Image
        src={like ? HeartRed : Heart}
        alt="like"
        width={24}
        height={24}
        className={`cursor-pointer object-contain stroke-lime-900`}
      />
    </div>
  );
};
export default LikeButton;
