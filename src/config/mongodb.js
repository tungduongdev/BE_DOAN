/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { env } from './environment.js'

import { MongoClient, ServerApiVersion } from 'mongodb'

//khoi tao 1 doi tuong ban dau laf null de connect toi database
let trelloDatabaseInstance = null

// khoi tao 1 doi tuong client de connect toi mongodb
const mongoClient = new MongoClient(env.MONGODB_URI, {
  //tu phien ban 5.0 tro len thi phai co serverApi
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

//ket noi toi database
export const CONNECT_DB = async () => {
  // goi toi monggo atlas de connect toi database
  await mongoClient.connect()
  //khi da connect thanh cong thi gan doi tuong database do vao bien trelloDatabaseInstance
  trelloDatabaseInstance = mongoClient.db(env.DATABASE_NAME)
}
// export ra de su dung o cac file khac
export const GET_DB = () => {
  //tra ve doi tuong database
  if (!trelloDatabaseInstance) throw new Error('MUST CONNECT DB first')
  return trelloDatabaseInstance
}

export const CLOSE_DB = async () => {
  await trelloDatabaseInstance.close()
}
