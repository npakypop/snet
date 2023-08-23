"use server"
import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
interface IUserParams{
    userId: string,
    username: string,
    name: string,
    bio: string,
    image: string,
    path: string,
}
//!дает возможность определить какая часть кода должна быть отрендерена на сервере
//! function to update the user
export async function updateUser(
    {userId,
    username,
    name,
    bio,
    image,
    path}:IUserParams//! так как передаваемых параметров в функцию много, то могут возникнуть проблемы из-зы не правильной очередности передачи значений при вызове этой функции. Для того что бы это избежать проще поместить все значения в объект, тогда не будет разницы каким по очереди указано значение, для этого сделал интерфейс с типами и аннотировал объект параметров в функции. Соответственно при вызове функции надо будет передавать в качестве аргумента объект с такими же полями как в аннотации и укзазывать значения. Эта функция вызывается в компоненте AccountProfile для обновления данных пользователя
): Promise<void>{
    console.log('zdraste: action')
    console.log({userId,
    username,
    name,
    bio,
    image,
    path})
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
        },
        {upsert:true}//! обновить и вставить upsert=> "update" and "insert". Будет обновлена существующая строка в БД если определенное значение уже есть в таблице, или вставлена новая строка в таблицу если значения не существует
    )

    if (path === '/profile/edit') {
            revalidatePath(path)//!позволяет вам повторно проверить данные, связанные с определенным путем. Это полезно в ситуациях, когда вы хотите обновить закешированные данные без ожидания истечения периода повторной проверки.
        }
    } catch (error: any) {
       throw new Error(`Failed to create/update user: ${error.message}`);
    }
    
}

export async function fetchUser(userId:string) {
    try {
        connectToDB();

        return await User
            .findOne({ id: userId },{ maxTimeMS: 1000000 })
            // .populate({
            // path: 'communities',
            // model: Community
        // })
    } catch (error:any) {
        throw new Error(`Faild to fetch user: ${error.message}`)
    }
}