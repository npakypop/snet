// ! тут будут прописаны правила для маршрутов авторизации. К примеру мы не хотим покеазывать навбар или футер здесь.
// ! этот лейаут относиться только к маршрутам которые находяться в подгруппе (auth)

import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";

import "../globals.css";
//! для лучшей оптимизации (СЕО) надо делать следующее:
export const metadata = {
  title: " Threads", //! name of app
  description: "A next.js 13 Meta Threads Application",
};

// определение шрифта
const inter = Inter({ subsets: ["latin"] }); //! импортируется из гугл шрифтов. Необходимо оборачивать в квадратніе скобки, так как свойство начертания ожидает массив

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-dark-1`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
