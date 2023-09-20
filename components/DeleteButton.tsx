"use client";

import React from "react";
import Image from "next/image";
import { deleteThread } from "@/lib/actions/thread.actions";
import { usePathname, useRouter } from "next/navigation";
interface Props {
  id: string;
}

function DeleteButton({ id }: Props) {
  const path = usePathname();
  function handleDelete() {
    deleteThread(id, path);
    console.log(`post with id ${id} and all its childrens has been deleted`);
  }

  return (
    <>
      <button onClick={handleDelete}>
        <Image
          src="/assets/delete.svg"
          alt="delete"
          width={24}
          height={24}
          className="cursor-pointer object-contain"
        />
      </button>
    </>
  );
}

export default DeleteButton;
