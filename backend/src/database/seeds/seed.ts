import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const userRepository = AppDataSource.getRepository(User);

  // Check if admin user exists
  const existingAdmin = await userRepository.findOne({
    where: { email: 'admin@example.com' },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      email: 'admin@example.com',
      password: hashedPassword,
    });
    await userRepository.save(admin);
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  await AppDataSource.destroy();
  console.log('Seed completed');
}

seed().catch(console.error);
