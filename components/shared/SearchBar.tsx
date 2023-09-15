"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Input } from "../ui/input";

interface Props {
  routeType: string;
}

function SearchBar({ routeType }: Props) {
  const router = useRouter(); //!используется для програмной навигации, обязательное условие использовать его только в клиентских компонентах "use client"( в большинстве случаев next.js документация рекомендует использовать Link)
  const [search, setSearch] = useState("");

  useEffect(() => {
    const delay = setTimeout(() => {
      if (search) {
        router.push(`/${routeType}?q=` + search); //! формируем строку запроса, переходим по адресу который приходит в переменную routeType и добавляем запрос из переменной search(/search?q=запрос)
      } else {
        router.push(`/${routeType}`);
      }
    }, 300);

    return () => clearTimeout(delay); //!отменяет выполнение функции delay в случае, если состояние search изменится снова до завершения задержки
  }, [search, routeType]);

  return (
    <div className="searchbar">
      <Image
        src="/assets/search-gray.svg"
        alt="search"
        width={24}
        height={24}
        className="object-contain"
      />
      <Input
        id="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={`${
          routeType === "search" ? "Search users" : "Search communities"
        }`}
        className="no-focus searchbar_input"
      />
    </div>
  );
}

export default SearchBar;
