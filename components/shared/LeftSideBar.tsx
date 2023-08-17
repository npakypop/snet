//! так как хук useRouter и usePathname работает только с компонентами на стороне клиента надо указать что этот файл будет работать именно там, если не указать то будет ошибка
"use client";

import { sidebarLinks } from "@/constants";
import { SignedIn, SignOutButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
function LeftSideBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <section className="custom-scrollbar leftsidebar">
      <div className="flex w-full flex-1 flex-col gap-6 px-6">
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
              className={`leftsidebar_link ${isActive && "bg-primary-500"}`}
            >
              <Image
                src={link.imgURL}
                alt={link.label}
                width={24}
                height={24}
              />
              <p className="text-light-1 max-lg:hidden">{link.label}</p>
            </Link>
          );
        })}
      </div>
      <div className="mt-10 px-6">
        <SignedIn>
          <SignOutButton signOutCallback={() => router.push("/sign-in")}>
            {/* signOutCallback это коллбек который будет вызван после того как пользователь успешно разлогиниться, в этом случае если юзер разлогиниться его сразу перенаправит на страницу с регистрацией */}
            <div className="flex cursor-pointer gap-4 px-4">
              <Image
                src="/assets/logout.svg"
                alt="logout"
                width={24}
                height={24}
              />
              <p className="text-light-2 max-lg:hidden">Logout</p>
            </div>
          </SignOutButton>
        </SignedIn>
      </div>
    </section>
  );
}

export default LeftSideBar;
