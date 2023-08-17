"use client";

import { sidebarLinks } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

function BottomBar() {
  const pathname = usePathname();

  return (
    <section className="bottombar">
      <div className="bottombar_container">
        {sidebarLinks.map((link) => {
          // Для того что бы отслеживать какая из ссылок сейчас активная сделали явный ретерн
          // Для того что бы определить активную ссылку надо использовать хуки usePathname, useRouter из библиотеки next/navigation, сможем узнать актуальный адрес URL
          const isActive =
            (pathname.includes(link.route) && link.route.length > 1) ||
            pathname === link.route;
          return (
            <Link
              href={link.route}
              key={link.label}
              className={`bottombar_link ${isActive && "bg-primary-500"}`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={24}
                height={24}
              />
              <p className="text-subtle-medium text-light-1 max-sm:hidden">
                {link.label.split(/\s+/)[0]}
                {/* так как create thread занимает две строки и в нижнем баре все съезжает использовал регулярное выраждение которое разделяет строку на отдельные подстроки через пробел и обращается только к первому элементу, то есть к слову create. получается что тогда все элементы нижнего меню будут одинакого размера. */}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default BottomBar;
