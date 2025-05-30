/* eslint-disable no-console */
import 'dotenv/config'
import express from 'express'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from './config/mongodb.js'
import { env } from './config/environment.js'
import { APIs_v1 } from './routes/v1/index.js'
import { errorHandlingMiddleware } from './middlewares/errorHandlingMiddleware.js'
import cors from 'cors'
import { corsOptions } from './config/cors.js'
import cookieParser from 'cookie-parser'
import http from 'http'
import { Server } from 'socket.io';
import { inviteUserToBoardSocket } from './sockets/inviteUserToBoardSocket.js'

const START_SERVER = () => {
  const app = express()
  // fix cache from disk của express
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(cookieParser())

  app.use(cors(corsOptions))

  //enable req.body json data
  app.use(express.json())

  app.use('/v1', APIs_v1)
  //midleware xu li loi tap trung
  app.use(errorHandlingMiddleware)

  const server = http.createServer(app);
  // khoi tao socket io va cors
  const io = new Server(server, { cors: { corsOptions } });

  io.on('connection', (socket) => {
    inviteUserToBoardSocket(socket)
  })

  server.listen(env.APP_PORT, env.APP_HOST2, () => {
    // eslint-disable-next-line no-console
    console.log(`Hello ${env.AUTHOR}, I am running at http:${env.APP_HOST}:${env.APP_PORT}`)
  })

  // thuc hien cac tac vu cleanup khi server dung
  exitHook(() => {
    console.log('Closing MongoDB ...')
    CLOSE_DB()
    console.log('MongoDB closed successfully!')
  })
}
// chi start server khi da connect toi database
(async () => {
  try {
    console.log('Trying connect to MongoDB ...')
    await CONNECT_DB()
    console.log('Connected to MongoDB successfully!')
    START_SERVER()
  } catch (error) {
    console.error('Error connecting to MongoDB:', error)
    process.exit(0)
  }
})()

//
// CONNECT_DB()
//   .then(() => console.log('Connected to MongoDB successfully!'))
//   .then(() => START_SERVER())
//   .catch((error) => {
//     console.error('Error connecting to MongoDB:', error)
//     process.exit(0)
//   }
//   )