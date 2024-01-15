import { db } from '../database/db';

interface User {
  id: number;
  username: string;
  password: string;
  email?: string;
  company_name?: string;
  phone?: string;
}

const getAllUsers = async (): Promise<User[]> => {
  try {
    return await db.any('SELECT * FROM users');
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

const getUserById = async (id: number): Promise<User> => {
  try {
    return await db.one('SELECT * FROM users WHERE id = $1', id);
  } catch (error) {
    console.error(`Error fetching user with id ${id}:`, error);
    throw error;
  }
};

const createUser = async (user: Omit<User, 'id'>): Promise<User> => {
  try {
    const { id } = await db.one(
      'INSERT INTO users (username, password, email, company_name, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [user.username, user.password, user.email, user.company_name, user.phone]
    );

    return { id, ...user };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

const updateUser = async (id: number, updatedData: Partial<User>): Promise<User> => {
  try {
    const existingUser = await getUserById(id);

    if (!existingUser) {
      throw new Error(`User with id ${id} not found`);
    }

    const updatedUser: User = {
      id,
      username: updatedData.username || existingUser.username,
      password: updatedData.password || existingUser.password,
      email: updatedData.email || existingUser.email,
      company_name: updatedData.company_name || existingUser.company_name,
      phone: updatedData.phone || existingUser.phone,
    };

    await db.none(
      'UPDATE users SET username = $1, password = $2, email = $3, company_name = $4, phone = $5 WHERE id = $6',
      [updatedUser.username, updatedUser.password, updatedUser.email, updatedUser.company_name, updatedUser.phone, id]
    );

    return updatedUser;
  } catch (error) {
    console.error(`Error updating user with id ${id}:`, error);
    throw error;
  }
};


const deleteUser = async (id: number): Promise<void> => {
  try {
    await db.none('DELETE FROM users WHERE id = $1', id);
  } catch (error) {
    console.error(`Error deleting user with id ${id}:`, error);
    throw error;
  }
};

export { getAllUsers, getUserById, createUser, updateUser, deleteUser };
