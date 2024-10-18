// helpers/userHelper.ts
import { faker } from '@faker-js/faker';

export interface User {
  id?: number;
  name: string;
  gender: 'male' | 'female';
  email: string;
  status: 'active' | 'inactive';
}

export function createRandomUser(overrides: Partial<User> = {}): User {
  const gender: 'male' | 'female' = faker.person.sexType();
  const newUser: User = {
    name: faker.person.fullName(),
    gender: gender,
    email: faker.internet.email(),
    status: 'active',
    ...overrides,
  };
  return newUser;
}
