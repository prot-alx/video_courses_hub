import { redirect } from "next/navigation";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TODO: Здесь будет проверка сессии и роли пользователя
  // const session = await getServerSession(authOptions);
  // if (!session || session.user.role !== 'ADMIN') {
  //   redirect('/auth/signin');
  // }

  // Пока что для MVP - просто отрендерим детей
  // В продакшене добавим проверку прав администратора

  return <>{children}</>;
}
