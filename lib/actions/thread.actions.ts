"use server"; //! обязательная деректива для работы с БД

// import { currentUser } from "@clerk/nextjs";
import { connectToDB } from "../mongoose";
// import { ThreadValidation } from "../validations/thread";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";

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

    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    }); //! после того как будет создано сообщение надо обновить модель пользователя

    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    }); //! надо обязательно после того как будет создано сообщение запушить это сообщение к создавшему его пользователю

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

export async function fetchThreadById(id: string) {
  connectToDB();

  try {
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id name id image",
      })
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
