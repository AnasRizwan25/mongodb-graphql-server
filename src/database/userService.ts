import { Collection, ObjectId } from 'mongodb';
import { getDatabase } from './connection.js';
import { User, CreateUserInput, UpdateUserInput } from '../types/index.js';

interface UserDocument {
  _id: ObjectId;
  name: string;
  email: string;
  age?: number;
  createdAt: Date;
}

export class UserService {
  private collection: Collection<UserDocument>;

  constructor() {
    const db = getDatabase();
    this.collection = db.collection<UserDocument>('users');
  }

  private toUser(doc: UserDocument): User {
    return {
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      age: doc.age,
      createdAt: doc.createdAt.toISOString(),
    };
  }

  async getAllUsers(): Promise<User[]> {
    const users = await this.collection.find().toArray();
    return users.map(doc => this.toUser(doc));
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const doc = await this.collection.findOne({ _id: new ObjectId(id) });
      return doc ? this.toUser(doc) : null;
    } catch (error) {
      return null;
    }
  }

  async createUser(input: CreateUserInput): Promise<User> {
    const newUser: Omit<UserDocument, '_id'> = {
      name: input.name,
      email: input.email,
      age: input.age,
      createdAt: new Date(),
    };

    const result = await this.collection.insertOne(newUser as UserDocument);
    
    const createdUser = await this.collection.findOne({ _id: result.insertedId });
    
    if (!createdUser) {
      throw new Error('Failed to create user');
    }

    return this.toUser(createdUser);
  }

  async updateUser(input: UpdateUserInput): Promise<User | null> {
    try {
      const updateFields: Partial<Omit<UserDocument, '_id'>> = {};
      
      if (input.name !== undefined) updateFields.name = input.name;
      if (input.email !== undefined) updateFields.email = input.email;
      if (input.age !== undefined) updateFields.age = input.age;

      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(input.id) },
        { $set: updateFields },
        { returnDocument: 'after' }
      );

      return result ? this.toUser(result) : null;
    } catch (error) {
      return null;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch (error) {
      return false;
    }
  }

  async createIndexes(): Promise<void> {
    await this.collection.createIndex({ email: 1 }, { unique: true });
    await this.collection.createIndex({ createdAt: -1 });
    console.log('Database indexes created');
  }
}