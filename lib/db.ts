import fs from 'fs/promises';
import path from 'path';
import mongoose, { Schema, model, models } from 'mongoose';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');
const USE_MONGO = !!process.env.MONGODB_URI;

// --- Types ---
export interface User {
  id: string;
  username: string;
  passwordHash: string;
}

export interface GiftList {
  id: string; // Mongo _id will be mapped to id
  ownerId: string;
  title: string;
  description?: string;
  theme?: string;
}

export interface GiftItem {
  id: string;
  listId: string;
  name: string;
  url?: string;
  price?: string;
  imageUrl?: string;
  isBought: boolean;
  boughtBy?: string;
  createdAt: number;
}

// --- Mongoose Schemas ---
const UserSchema = new Schema({
  id: String, // We'll keep using UUIDs for consistency or just map _id
  username: { type: String, required: true, unique: true },
  passwordHash: String,
});

const ListSchema = new Schema({
  id: String,
  ownerId: String,
  title: String,
  description: String,
  theme: String,
});

const ItemSchema = new Schema({
  id: String,
  listId: String,
  name: String,
  url: String,
  price: String,
  imageUrl: String,
  isBought: { type: Boolean, default: false },
  boughtBy: String,
  createdAt: Number,
});

// Prevent overwrite errors in dev HMR
const UserModel = models.User || model('User', UserSchema);
const ListModel = models.List || model('List', ListSchema);
const ItemModel = models.Item || model('Item', ItemSchema);

// --- MongoDB Connection ---
let isConnected = false;
async function connectMongo() {
  if (isConnected) return;
  if (!process.env.MONGODB_URI) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB Connection Error:', error);
  }
}

// --- JSON Helper ---
async function readJsonDb() {
  try {
    await fs.access(DB_PATH);
  } catch {
    await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
    await fs.writeFile(DB_PATH, JSON.stringify({ users: [], lists: [], items: [] }, null, 2));
  }
  const data = await fs.readFile(DB_PATH, 'utf-8');
  return JSON.parse(data);
}

async function writeJsonDb(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
}

// --- Data Access Methods ---

export async function getUser(username: string): Promise<User | undefined> {
  if (USE_MONGO) {
    await connectMongo();
    const user = await UserModel.findOne({ username }).lean();
    if (!user) return undefined;
    return { ...user, id: user.id || user._id.toString() } as any;
  } else {
    const db = await readJsonDb();
    return db.users.find((u: User) => u.username === username);
  }
}

export async function createUser(user: User): Promise<User> {
  if (USE_MONGO) {
    await connectMongo();
    const newUser = await UserModel.create(user);
    return { ...newUser.toObject(), id: newUser.id || newUser._id.toString() };
  } else {
    const db = await readJsonDb();
    db.users.push(user);
    await writeJsonDb(db);
    return user;
  }
}

export async function getLists(ownerId: string): Promise<GiftList[]> {
  if (USE_MONGO) {
    await connectMongo();
    const lists = await ListModel.find({ ownerId }).lean();
    return lists.map((l: any) => ({ ...l, id: l.id || l._id.toString() }));
  } else {
    const db = await readJsonDb();
    return db.lists.filter((l: GiftList) => l.ownerId === ownerId);
  }
}

export async function getListById(id: string): Promise<GiftList | undefined> {
  if (USE_MONGO) {
    await connectMongo();
    // Try finding by custom 'id' field first (UUID), then _id
    let list = await ListModel.findOne({ id }).lean();
    if (!list && mongoose.isValidObjectId(id)) {
      list = await ListModel.findById(id).lean();
    }
    if (!list) return undefined;
    return { ...list, id: list.id || list._id.toString() } as any;
  } else {
    const db = await readJsonDb();
    return db.lists.find((l: GiftList) => l.id === id);
  }
}

export async function createList(list: GiftList): Promise<GiftList> {
  if (USE_MONGO) {
    await connectMongo();
    const newList = await ListModel.create(list);
    return { ...newList.toObject(), id: newList.id || newList._id.toString() };
  } else {
    const db = await readJsonDb();
    db.lists.push(list);
    await writeJsonDb(db);
    return list;
  }
}

export async function getItems(listId: string): Promise<GiftItem[]> {
  if (USE_MONGO) {
    await connectMongo();
    const items = await ItemModel.find({ listId }).lean();
    return items.map((i: any) => ({ ...i, id: i.id || i._id.toString() }));
  } else {
    const db = await readJsonDb();
    return db.items.filter((i: GiftItem) => i.listId === listId);
  }
}

export async function createItem(item: GiftItem): Promise<GiftItem> {
  if (USE_MONGO) {
    await connectMongo();
    const newItem = await ItemModel.create(item);
    return { ...newItem.toObject(), id: newItem.id || newItem._id.toString() };
  } else {
    const db = await readJsonDb();
    db.items.push(item);
    await writeJsonDb(db);
    return item;
  }
}

export async function updateItemStatus(itemId: string, isBought: boolean, boughtBy?: string) {
  if (USE_MONGO) {
    await connectMongo();
    let query: any = { id: itemId };
    if (mongoose.isValidObjectId(itemId)) query = { _id: itemId };

    // Fallback if we are using uuid in mongo
    // For now assume we search by 'id' string field

    const updated = await ItemModel.findOneAndUpdate(
      { id: itemId },
      { isBought, boughtBy },
      { new: true }
    ).lean();
    return updated;
  } else {
    const db = await readJsonDb();
    const index = db.items.findIndex((i: GiftItem) => i.id === itemId);
    if (index !== -1) {
      db.items[index].isBought = isBought;
      db.items[index].boughtBy = boughtBy;
      await writeJsonDb(db);
      return db.items[index];
    }
    return null;
  }
}

export async function deleteItem(itemId: string) {
  if (USE_MONGO) {
    await connectMongo();
    await ItemModel.findOneAndDelete({ id: itemId });
    return true;
  } else {
    const db = await readJsonDb();
    const index = db.items.findIndex((i: GiftItem) => i.id === itemId);
    if (index !== -1) {
      db.items.splice(index, 1);
      await writeJsonDb(db);
      return true;
    }
    return false;
  }
}
