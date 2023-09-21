"use server";
import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";
import Community from "../models/community.model";
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
  try {
    connectToDB();

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
    return await User.findOne({ id: userId }).populate({
      path: "communities",
      model: Community,
    });
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
      populate: [
        {
          path: "community",
          model: Community,
          select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id", // Select the "name" and "_id" fields from the "User" model
          },
        },
      ],
    });
    return threads;
  } catch (error: any) {
    throw new Error(`Error fetching posts: ${error.message}`);
  }
}

export async function fetchUsers({
  userId, //! Айдиентификатор текущего пользователя, для которого необходимо исключить его из результатов поиска.
  searchString = "", //!Строка поиска, которую пользователь ввел для поиска других пользователей. По умолчанию пустая строка.
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
    const regex = new RegExp(searchString, "i"); //! Создание регулярного выражения для поиска с игнорированием регистра. Поиск будет осуществляться без учета регистра.  Ключ "i" означает регистронезависимый поиск.

    //* запрос
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId }, //! ($ne:userId => not equel to userId) отфильтрует айди текущего пользователя
    };

    if (searchString.trim() !== "") {
      //! проверяю сущществует ли вообще что-то в строке поиска
      query.$or = [
        //! Используется оператор $or для выполнения поиска по двум полям. Для того что быиспользовать $or, надо было указать тип для query выше
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ]; //! поиск стразу  по username и name
    }

    const sortOptions = { createdAt: sortBy }; //! параметры сортировки

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize); //! Делаем поиск, затем результат поиска сортеруем по указаным параметрам сортировки, пропускаем результаты поиска что перейти на указаную страницу и выводим только указаное колличество результатов

    const totalUsersCount = await User.countDocuments(query); //! считаем общее колличество найденых результатов

    const users = await usersQuery.exec(); //! запускаем запрос на поиск и сортировку

    const isNext = totalUsersCount > skipAmount + users.length; //! проверяем есть ли еще страницы после этой

    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Error fetching users: ${error.message}`);
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();

    const userThreads = await Thread.find({ author: userId }); //! поиск всех постов которые создал пользователь

    const childThreadIds: string[] = userThreads.reduce((acc, userThread) => {
      // console.log("acc", acc);
      return acc.concat(userThread.children);
    }, []); //! сбор всех айдишников комментариев к постам, т.е. элементы массива children у каждого из постов

    //! получение доступа ко всем комментариям кроме тех которые оставил сам пользователь

    const replies = Thread.find({
      _id: { $in: childThreadIds }, //! поиск документов, у которых _id соответствуют значениям из массива childThreadIds.
      author: { $ne: userId },
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });
    // console.log("getActivity ~ replies:", replies);

    return replies;
  } catch (error: any) {
    throw new Error(`Failed fetch activity: ${error.message}`);
  }
}

export async function addToLiked(
  threadId: string,
  currentUserId: string,
  path: string
) {
  // console.log(currentUserId);
  try {
    connectToDB();

    const actualUser = await User.findOne({ id: currentUserId }); //! поиск таким методом так как currentUserId приходит из клерка и это значение в БД указано как поле id, если же пользоваться методом findById то тогда метод будет обращаться к полю _id, которое создает сама БД. По сути findById это тоже самое что findOne({ _id: сurrentUserId }), за исключением обработки undefined. Подробнее в документации к  методу findById.
    const actualThread = await Thread.findById(threadId);
    console.log("currentUserId:", currentUserId);
    if (!actualThread) {
      throw new Error("Пост не найден"); //! Обработка случая, если пост не найден
    }
    // if (actualThread.likes.includes(currentUserId)) {
    //   throw new Error("Пользователь уже лайкнул этот пост"); //! Обработка случая, если пользователь уже лайкнул пост
    // }
    actualUser.liked.push(threadId);

    actualThread.likes.push(actualUser._id); //! обращаюсь к полю actualUser._id так как в модели указан тип для этого значения mongoose.Schema.Types.ObjectId, Сюда нельзя записать строку здесь должен быть значения типа объект

    await actualUser.save();
    await actualThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`error while like: ${error.message}`);
  }
}

export async function removeFromLiked(
  threadId: string,
  currentUserId: string,
  path: string
) {
  try {
    connectToDB();

    const actualUser = await User.findOne({ id: currentUserId });

    const index = actualUser.liked.indexOf(threadId);

    if (index !== -1) {
      actualUser.liked.splice(index, 1);
    }
    await actualUser.save();
    revalidatePath(path);
    // console.log("actualUser:", actualUser);
  } catch (error) {
    throw new Error(`thread not found`);
  }
}
