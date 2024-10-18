# API Testing with Playwright and TypeScript

This project demonstrates how to perform API testing using [Playwright Test](https://playwright.dev/docs/test-api-testing) with TypeScript. It includes setting up a test framework, writing tests with best practices, using helper functions, and integrating continuous integration using GitHub Actions.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Setup](#project-setup)
- [Environment Variables](#environment-variables)
- [Installing Dependencies](#installing-dependencies)
- [Running Tests Locally](#running-tests-locally)
- [Project Structure](#project-structure)
- [Writing Tests](#writing-tests)
- [Helper Functions](#helper-functions)
- [Configuration Files](#configuration-files)
- [Continuous Integration with GitHub Actions](#continuous-integration-with-github-actions)
- [Best Practices](#best-practices)
- [Additional Scripts](#additional-scripts)
- [License](#license)
- [Conclusion](#conclusion)

---

## Prerequisites

- **Node.js**: Version 20.x or later.
- **npm**: Version 10.x or later.
- **Git**: For version control.
- **GitHub Account**: To use GitHub Actions for CI.

---

## Project Setup

Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/enginSacan/GorestapiDemo.git
cd GorestapiDemo
```

---

## Environment Variables

### 1. GoRest API Access Token

This project uses the [GoRest API](https://gorest.co.in/) for testing purposes. You'll need to generate an access token:

1. **Sign Up / Log In**: Go to [GoRest.co.in](https://gorest.co.in/) and sign up or log in.
2. **Generate Access Token**:
   - Navigate to the "Access Token" section.
   - Generate a new personal access token.
3. **Copy the Token**: Copy the generated token (without the "Bearer " prefix).

### 2. Local `.env` File

Create a `.env` file at the root of the project to store your access token:

```bash
touch .env
```

Add the following line to `.env`:

```dotenv
ACCESS_TOKEN=your_actual_access_token_here
```

**Important**: Replace `your_actual_access_token_here` with your actual access token. Do not include the "Bearer " prefix.

### 3. `.gitignore` Update

Ensure the `.env` file is ignored by Git:

```gitignore
.env
```

---

## Installing Dependencies

Install all necessary dependencies:

```bash
npm install
```

---

## Running Tests Locally

Run the tests using the following command:

```bash
npx playwright install --with-deps
npx playwright test
```

---

## Project Structure

```
api-playwright-tests/
├── .github/
│   └── workflows/
│       └── ci.yml
├── helpers/
│   └── userHelper.ts
├── tests/
│   └── api.spec.ts
├── .env
├── .gitignore
├── package.json
├── playwright.config.ts
└── README.md
```

- **`.github/workflows/ci.yml`**: GitHub Actions workflow configuration.
- **`helpers/userHelper.ts`**: Helper functions for generating test data.
- **`tests/api.spec.ts`**: API tests written in TypeScript.
- **`playwright.config.ts`**: Playwright configuration file.
- **`package.json`**: Project metadata and scripts.
- **`README.md`**: Project documentation.

---

## Writing Tests

### Test File: `tests/api.spec.ts`

This file contains API tests using Playwright's test runner.

```typescript
import { test, expect } from '@playwright/test';
import { createRandomUser, User } from '../helpers/userHelper';

test.describe('GoRest API Tests', () => {
  let createdUserIds: number[] = [];

  test('Create a New User', async ({ request }) => {
    const newUser: User = createRandomUser();

    const response = await request.post('/users', { data: newUser });
    expect(response.status()).toBe(201);

    const user: User = await response.json();
    expect(user).toMatchObject(newUser);

    createdUserIds.push(user.id as number);
  });

  test.afterEach(async ({ request }) => {
    for (const userId of createdUserIds) {
      await request.delete(`/users/${userId}`);
    }
    createdUserIds = [];
  });
});
```

**Key Points**:

- **Using TypeScript**: Provides type safety and better IDE support.
- **Helper Functions**: Uses `createRandomUser` from `userHelper.ts`.
- **Cleanup**: Deletes created users after each test.

---

## Helper Functions

### Helper File: `helpers/userHelper.ts`

Contains functions to generate test data.

```typescript
import { faker } from '@faker-js/faker';

export interface User {
  id?: number;
  name: string;
  gender: 'male' | 'female';
  email: string;
  status: 'active' | 'inactive';
}

export function createRandomUser(overrides: Partial<User> = {}): User {
  const gender: 'male' | 'female' = faker.helpers.arrayElement(['male', 'female']);
  const newUser: User = {
    name: faker.name.fullName({ sex: gender }),
    gender,
    email: faker.internet.email(),
    status: 'active',
    ...overrides,
  };
  return newUser;
}
```

**Key Points**:

- **Faker Library**: Generates realistic and unique test data.
- **TypeScript Interfaces**: Defines the `User` interface for type safety.
- **Overrides**: Allows customization of generated data.

---

## Configuration Files

### Playwright Configuration: `playwright.config.ts`

Configures Playwright for testing.

```typescript
import { PlaywrightTestConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

const config: PlaywrightTestConfig = {
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  reporter: 'list',
  use: {
    baseURL: 'https://gorest.co.in/public/v2',
    extraHTTPHeaders: {
      'Authorization': `Bearer ${process.env.ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  },
};

export default config;
```

**Key Points**:

- **Environment Variables**: Uses `dotenv` to load the access token.
- **Authorization Header**: Constructs the `Authorization` header with "Bearer " prefix.
- **Base URL**: Sets the base URL for API requests.

### TypeScript Configuration: `tsconfig.json`

Configures the TypeScript compiler.

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "CommonJS",
    "lib": ["ESNext"],
    "moduleResolution": "Node",
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "noImplicitAny": false,
    "outDir": "dist",
    "rootDir": ".",
    "types": ["node", "playwright"],
    "resolveJsonModule": true
  },
  "include": ["tests/**/*.ts", "helpers/**/*.ts", "playwright.config.ts"],
  "exclude": ["node_modules"]
}
```

---

## Continuous Integration with GitHub Actions

### Workflow File: `.github/workflows/ci.yml`

Automates testing with each push or pull request.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  api-tests:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Code
      uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'

    - name: Install Dependencies
      run: npm install

    - name: Run Playwright Tests
      env:
        ACCESS_TOKEN: ${{ secrets.ACCESS_TOKEN }}
      run: npm test
```

**Key Points**:

- **Access Token Secret**: Uses `secrets.ACCESS_TOKEN` to securely pass the token.
- **Environment Variable**: Sets `ACCESS_TOKEN` for use in the tests.
- **Automatic Testing**: Runs tests on `push` and `pull_request` events.

### Adding the Access Token to GitHub Secrets

1. **Navigate to Repository Settings**:

   - Go to your GitHub repository.
   - Click on `Settings` > `Secrets and variables` > `Actions`.

2. **Add New Secret**:

   - Click `New repository secret`.
   - **Name**: `ACCESS_TOKEN`
   - **Value**: Your GoRest access token (without "Bearer ").
   - Click `Add secret`.

---

## Best Practices

- **TypeScript**: Provides type safety and better code maintenance.
- **Data Generation**: Uses `@faker-js/faker` to generate realistic and unique data.
- **Helper Functions**: Encapsulates data creation logic for reusability.
- **Environment Variables**: Manages sensitive data securely.
- **Cleanup**: Implements teardown logic to maintain test environment integrity.
- **Continuous Integration**: Uses GitHub Actions for automated testing.
- **Code Quality**: Optionally integrate ESLint and Prettier for consistent code style.

---

## Additional Scripts

Add useful scripts to your `package.json`:

```json
"scripts": {
  "test": "npx playwright test",
  "test:debug": "npx playwright test --debug",
  "lint": "eslint 'tests/**/*.ts' 'helpers/**/*.ts'"
}
```

- **`test`**: Runs the test suite.
- **`test:debug`**: Runs tests in debug mode.
- **`lint`**: Lints the TypeScript files (requires ESLint setup).

---

## License

This project is licensed under the MIT License.

---

## Conclusion

By following this guide, you have set up an API testing framework using Playwright with TypeScript, integrated best practices, and configured continuous integration using GitHub Actions. This setup provides a robust foundation for testing APIs efficiently and securely.

---

**Note**: Replace placeholders like `yourusername` and `your_actual_access_token_here` with your actual GitHub username and access token.

---