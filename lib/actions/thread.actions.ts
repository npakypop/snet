"use server"; //! обязательная деректива для работы с БД

// import { currentUser } from "@clerk/nextjs";
import { connectToDB } from "../mongoose";
// import { ThreadValidation } from "../validations/thread";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";
import Community from "../models/community.model";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();

    const communityIdObject = await Community.findOne(
      { id: communityId },
      { _id: 1 }
    );

    const createdThread = await Thread.create({
      text,
      author,
      community: communityIdObject, //! Assign communityId if provided, or leave it null for personal account
    }); //! после того как будет создано сообщение надо обновить модель пользователя

    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    }); //! надо обязательно после того как будет создано сообщение запушить это сообщение к создавшему его пользователю

    if (communityIdObject) {
      //! Update Community model
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { threads: createdThread._id },
      });
    } //! обновление Community model

    revalidatePath(path); //! что бы изменения срузу же применились на сайте
  } catch (error: any) {
    throw new Error(`Error creating thread: ${error.message}`);
  }
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
  connectToDB();
  //! Для того что бы сделать пагинацию сначала надо определить на какой странице находимся, надо посчитать сколько постов надо пропустить в зависимости от того на какой странице находимся
  const skipAmount = (pageNumber - 1) * pageSize;
  // ! Здесь делаем запрос записей у которых нет родителей, тоесть записи верхнего уровня, без комментариев к ним
  const postQuery = Thread.find({ parentId: { $in: [null, undefined] } }) //! $in: используется для проверки, принадлежит ли значение поля(parentId) к одному из указанных значений в массиве[null, undefined].
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({
      path: "community",
      model: Community,
    })
    .populate({
      path: "children", //! дочерние эелементы(комментарии к постам)
      populate: {
        //! информация об авторе каждого поста
        path: "author",
        model: User,
        select: "_id name parentId image", //! Какие поля выбрать из коллекции "users"
      },
    });

  const totalPostCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  }); //! колличество постов(не комментов). countDocuments позволяет определить количество документов в коллекции, которые соответствуют заданным фильтрам.

  const posts = await postQuery.exec(); //! для выполнения цепочки методов для поиска постов (для их запуска) используется exec(), он запустит эту цепочку и вернет результат уже в переменную posts. Когда я хочу выполнить запрос и получить результаты, вызывается метод .exec()

  const isNext = totalPostCount > skipAmount + posts.length; //! проверяю если общее колличество постов больше чем сумма пропущщеных постов и постов на актуальной странице. Если да, то тогда есть следующая страница
  return { posts, isNext };
}

export async function fetchThreadById(threadId: string) {
  connectToDB();

  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id name id image",
      })
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      }) // !Populate the community field with _id and name
      .populate({
        path: "children", //! Сначала загружаем связвніе данные для комментов
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();
    return thread;
  } catch (error: any) {
    throw new Error(`Error fetching thread: ${error.message}`);
  }
}

// export async function addToLiked(threadId: string, currentUserId: string) {
//   // console.log(currentUserId);
//   try {
//     connectToDB();

//     const actualUser = await User.findOne({ id: currentUserId }); //! поиск таким методом так как currentUserId приходит из клерка и это значение в БД указано как поле id, если же пользоваться методом findById то тогда метод будет обращаться к полю _id, которое создает сама БД. По сути findById это тоже самое что findOne({ _id: сurrentUserId }), за исключением обработки undefined. Подробнее в документации к  методу findById.
//     actualUser.liked.push(threadId);
//     await actualUser.save();
//     // console.log("addToFav ~ actualUser:", actualUser);
//   } catch (error) {
//     throw new Error(`thread not found`);
//   }
// }

// export async function removeFromLiked(threadId: string, currentUserId: string) {
//   try {
//     connectToDB();

//     const actualUser = await User.findOne({ id: currentUserId });

//     const index = actualUser.liked.indexOf(threadId);

//     if (index !== -1) {
//       actualUser.liked.splice(index, 1);
//     }
//     await actualUser.save();
//     // console.log("actualUser:", actualUser);
//   } catch (error) {
//     throw new Error(`thread not found`);
//   }
// }

export async function addCommentToThread(
  threadId: string,
  commenmtText: string,
  userId: string,
  path: string
) {
  connectToDB();
  try {
    //!сначала ищем пост на который оставляем комментарий по айди
    const originalThread = await Thread.findById(threadId);
    if (!originalThread) {
      throw new Error(`Thread not found`);
    }
    //! если проверка прошла успешно то тогда создаем комментарий, по сути это новый пост(thread)только уже с текстом комментария
    const commentThread = new Thread({
      text: commenmtText,
      author: userId,
      parentId: threadId,
    });
    //! После того как создали надо сохранить его в БД
    const savedCommentThread = await commentThread.save();
    //! после  сохранения коммента надо обновить оригинальный пост к которому  этот комментарий был написан, те добавить в массив children этого поста

    originalThread.children.push(savedCommentThread._id);

    //! сохранить оригинальный пост
    await originalThread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Error adding comment to thread: ${error.message}`);
  }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });

  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
  //* При удалении поста удалять у пользователей айди поста который он лайкнул

  try {
    connectToDB();

    const mainThread = await Thread.findById(id).populate("author community"); //! Функция ищет основную ветку (main thread) которую надо удвлить по её id. Основная ветка загружается с подробными данными, включая информацию об авторе (author) и сообществе (community)

    if (!mainThread) {
      throw new Error("Thread not found");
    } //!Если основная ветка не найдена, выбрасывается сообщение.

    const descendantThreads = await fetchAllChildThreads(id); //!чтобы найти все дочерние ветки и их потомков

    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ]; //!содержит ID всех потомков включая основную ветку.

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child threads and their descendants
    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}
