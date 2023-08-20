import mongoose from "mongoose";

let isConnected = false; //! переменная для проверки статуса подключения к бд

export const connerctDB = async () => {
    mongoose.set('strictQuery', true);//!  Mongoose будет более строго проверять запросы, чтобы они соответствовали определенным схемам данных (моделям). Если запрос содержит поля, которые не определены в схеме, Mongoose может выбросить ошибку или игнорировать неправильные поля в запросе, в зависимости от настроек.
    if(!process.env.MONGODB_URL) return console.log('MONGODB_URL NOT FOUND');//! Так же надо иметь специальный ЮРЛ для подключения к БД, если его нет то будет сообщение
    if (isConnected) return console.log('ALready connected to MongoDB');//! if already is connected, get a message
    try {
        await mongoose.connect(process.env.MONGODB_URL)//! connect to DB
        isConnected = true
        console.log('Connected to MongoDB');
    } catch (error) {
        console.log(error);
    }
}