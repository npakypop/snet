"use client";
import React from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface Props {
  isNext: boolean;
  pageNumber: number; //!Номер текущей страницы
  path: string;
}

function Pagination({ path, pageNumber, isNext }: Props) {
  const router = useRouter(); //! доступа к текущему роуту

  const handleNavigation = (type: string) => {
    let nextPageNumber = pageNumber; //!инициализируется текущим номером страницы

    if (type === "prev") {
      nextPageNumber = Math.max(1, pageNumber - 1); //!для того, чтобы гарантировать, что номер предыдущей страницы не будет меньше 1. Если pageNumber - 1 меньше 1 (например, пользователь находится на первой странице), то значение будет установлено на 1. Если pageNumber - 1 больше или равно 1, то это значение будет использовано как номер предыдущей страницы. Позволяет корректно определить номер предыдущей страницы, учитывая, что номер страницы не может быть меньше 1.
    } else if (type === "next") {
      nextPageNumber = pageNumber + 1;
    }

    if (nextPageNumber > 1) {
      router.push(`/${path}?page=${nextPageNumber}`);
    } else {
      router.push(`/${path}`);
    }
  };

  if (!isNext && pageNumber === 1) return null;

  return (
    <div className="mt-10 flex justify-center items-center gap-10">
      <Button
        onClick={() => handleNavigation("prev")}
        disabled={pageNumber === 1}
        className="!text-small-regular text-light-2"
      >
        Previous
      </Button>
      <p className="text-base-semibold text-light-1">{pageNumber}</p>
      <Button
        onClick={() => handleNavigation("next")}
        className="!text-small-regular text-light-2"
        disabled={!isNext}
      >
        Next
      </Button>
    </div>
  );
}

export default Pagination;
