import { MongoClient, Db } from 'mongodb'

const DEFAULT_URI =
  'mongodb+srv://visputefoodcourt_db_user:IzwgbQhmWz8nLMu5@cluster0.k0bkmub.mongodb.net/vispute?retryWrites=true&w=majority'

const uri = process.env.MONGODB_URI || DEFAULT_URI
const dbName = process.env.MONGODB_DB || 'vispute'

let client: MongoClient
let clientPromise: Promise<MongoClient>

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

export function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri)
      global._mongoClientPromise = client.connect()
    }
    return global._mongoClientPromise
  } else {
    if (!clientPromise) {
      client = new MongoClient(uri)
      clientPromise = client.connect()
    }
    return clientPromise
  }
}

export async function getDb(): Promise<Db> {
  const connectedClient = await getClientPromise()
  return connectedClient.db(dbName)
}

export default getClientPromise
