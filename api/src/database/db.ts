import pgPromise from 'pg-promise';
import bcrypt from 'bcrypt';

const pgp = pgPromise();
const db = pgp('postgres://postgres:root@localhost:5432/SonnenSoftware');

const runMigrations = async () => {
  try {
    // Verificar se a tabela 'users' existe
    const tableExists = await db.oneOrNone(
      "SELECT to_regclass('public.users') AS table_exists"
    );

    if (!tableExists.table_exists) {
      // Criar a tabela de usuários com id aleatório
      await db.query(`
        CREATE TABLE public.users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          username VARCHAR(255) NOT NULL,
          password VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          company_name VARCHAR(255),
          phone VARCHAR(20)
        )
      `);

      // Inserir 20 usuários de teste
      const users = [
        ['john_doe', 'root', 'john.doe@example.com', 'ABC Corp', '123-456-7890'],
        ['jane_smith', 'root', 'jane.smith@example.com', 'XYZ Ltd', '987-654-3210'],
        ['michael_jones', 'root', 'michael.jones@example.com', '123 Industries', '555-1234-5678'],
        ['emily_davis', 'root', 'emily.davis@example.com', 'Tech Innovators', '333-5678-9012'],
        ['robert_brown', 'root', 'robert.brown@example.com', 'Global Solutions', '777-9876-5432'],
        ['olivia_taylor', 'root', 'olivia.taylor@example.com', 'Innovate Co.', '888-4321-8765'],
        ['william_martin', 'root', 'william.martin@example.com', 'Future Enterprises', '999-8765-4321'],
        ['ava_morris', 'root', 'ava.morris@example.com', 'Data Dynamics', '111-2345-6789'],
        ['james_anderson', 'root', 'james.anderson@example.com', 'Tech Innovations', '444-6789-0123'],
        ['sophia_white', 'root', 'sophia.white@example.com', 'Digital Solutions', '666-8901-2345'],
        ['logan_taylor', 'root', 'logan.taylor@example.com', 'Tech Co.', '222-9012-3456'],
        ['emma_clark', 'root', 'emma.clark@example.com', 'InnoTech', '777-0123-4567'],
        ['ethan_wilson', 'root', 'ethan.wilson@example.com', 'Data Dynamics', '555-4567-8901'],
        ['isabella_baker', 'root', 'isabella.baker@example.com', 'Tech Solutions', '888-6789-0123'],
        ['noah_morgan', 'root', 'noah.morgan@example.com', 'Future Tech', '444-7890-1234'],
        ['oliver_king', 'root', 'oliver.king@example.com', 'InnoSolutions', '111-8901-2345'],
        ['chloe_hill', 'root', 'chloe.hill@example.com', 'Tech Innovate', '333-0123-4567'],
        ['lucas_turner', 'root', 'lucas.turner@example.com', 'Digital Dynamics', '222-2345-6789'],
        ['mia_miller', 'root', 'mia.miller@example.com', 'Future Solutions', '666-3456-7890'],
        ['aiden_carter', 'root', 'aiden.carter@example.com', 'Tech Innovations', '777-5678-9012'],
      ];

      // Formatar os dados para a inserção
      const formattedUsers = await Promise.all(
        users.map(async user => {
          const hashedPassword = await bcrypt.hash(user[1], 10); // 10 é o custo do hash
          return `('${user[0]}', '${hashedPassword}', '${user[2]}', '${user[3]}', '${user[4]}')`;
        })
      );
      // Executar a inserção
      await db.query(`
        INSERT INTO public.users (username, password, email, company_name, phone)
        VALUES ${formattedUsers}
      `);

      console.log('Migrations completed.');
    } else {
      console.log('Table "users" already exists. Migrations not needed.');
    }
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
};

export { db, runMigrations };
