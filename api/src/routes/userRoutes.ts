import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { getAllUsers, getUserById, updateUser, deleteUser } from '../controllers/userQueries';

interface Params {
  id: string;
}

interface CreateUserPayload {
  username: string;
  password: string;
  email: string;
  company_name: string;
  phone: string;
}

interface UpdateUserPayload {
  username?: string;
  password?: string;
  email?: string;
  company_name?: string;
  phone?: string;
}

const userRoutes = async (fastify: FastifyInstance) => {
  // Obter todos os usuários
  fastify.get('/users', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      const users = await getAllUsers();
      reply.send({ users });
    } catch (error) {
      console.error('Error fetching all users:', error);
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  // Obter um usuário por ID
  fastify.get('/users/:id', async (request: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => {
    try {
      const userId = parseInt(request.params.id, 10);

      const user = await getUserById(userId);

      if (user) {
        reply.send({ user });
      } else {
        reply.status(404).send({ error: 'User not found' });
      }
    } catch (error) {
      console.error(`Error fetching user with id ${request.params.id}:`, error);
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  // Atualizar um usuário existente
  fastify.put('/users/:id', async (request: FastifyRequest<{ Params: Params; Body: UpdateUserPayload }>, reply: FastifyReply) => {
    try {
      const userId = parseInt(request.params.id, 10);
      const updatedUserData = request.body as UpdateUserPayload;

      // Adicione a lógica de validação aqui, se necessário

      // Implemente a lógica de atualização do usuário no banco de dados
      const updatedUser = await updateUser(userId, updatedUserData);

      reply.send({ message: 'User updated successfully', user: updatedUser });
    } catch (error) {
      console.error(`Error updating user with id ${request.params.id}:`, error);
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  // Excluir um usuário
  fastify.delete('/users/:id', async (request: FastifyRequest<{ Params: Params }>, reply: FastifyReply) => {
    try {
      const userId = parseInt(request.params.id, 10);

      // Implemente a lógica de exclusão do usuário no banco de dados
      await deleteUser(userId);

      reply.send({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(`Error deleting user with id ${request.params.id}:`, error);
      reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
};

export default userRoutes;
