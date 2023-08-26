"use server";
import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import { SortOrder } from "mongoose";
interface IUserParams {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}
//!дает возможность определить какая часть кода должна быть отрендерена на сервере
//! function to update the user
export async function updateUser(
  { userId, username, name, bio, image, path }: IUserParams //! так как передаваемых параметров в функцию много, то могут возникнуть проблемы из-зы не правильной очередности передачи значений при вызове этой функции. Для того что бы это избежать проще поместить все значения в объект, тогда не будет разницы каким по очереди указано значение, для этого сделал интерфейс с типами и аннотировал объект параметров в функции. Соответственно при вызове функции надо будет передавать в качестве аргумента объект с такими же полями как в аннотации и укзазывать значения. Эта функция вызывается в компоненте AccountProfile для обновления данных пользователя
): Promise<void> {
  //! calls to DB
  connectToDB();
  try {
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      }, //! обїект которым будет обновляться юзер
      { upsert: true } //! обновить и вставить upsert=> "update" and "insert". Будет обновлена существующая строка в БД если определенное значение уже есть в таблице, или вставлена новая строка в таблицу если значения не существует
    );

    if (path === "/profile/edit") {
      revalidatePath(path); //!позволяет вам повторно проверить данные, связанные с определенным путем. Это полезно в ситуациях, когда вы хотите обновить закешированные данные без ожидания истечения периода повторной проверки.
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();
    return await User.findOne({ id: userId });
    // .populate({
    // path: 'communities',
    // model: Community
    // })
  } catch (error: any) {
    throw new Error(`Faild to fetch user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();
    //! почссле того как подлючились к БД надо найти все посты автором которых является пользователь с данным userId
    //*TODO populate community
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: {
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "name image id",
        },
      },
    });
    return threads;
  } catch (error: any) {
    throw new Error(`Error fetching posts: ${error.message}`);
  }
}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder; //! тип из mongoose который отвечает за сортровку
}) {
  try {
    connectToDB();

    //*пагинация
    const skipAmount = (pageNumber - 1) * pageSize; //! эти значения приходят из params
    const regex = new RegExp(searchString, "i"); //! использование регулярного выражения без учета регистра для поиска пользователя. поиск будет регистронезависимым и найдет пользователей независимо от того, какой регистр используется в запросе.  Ключ "i" означает регистронезависимый поиск.
  } catch (error) {}
}
