//! Єтот файл создается для авторизации через клерк, документация требует создания єтого файла с таким содержимім

import { authMiddleware } from "@clerk/nextjs";

// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/nextjs/middleware for more information about configuring your middleware
export default authMiddleware({
    publicRoutes: ['/', '/api/webhook/clerk'], //! єто будет использоваться для подключения вебхук функционала для организаций
    ignoredRoutes: ['/api/webhook/clerk'] //! єто маршруті которіе игнорируются клерком
});//! в моем случае  добавил дополнительную конфигурацию 

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
