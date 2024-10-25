
# OG Games Backend

This is the backend for **OG Games**, a real-time multiplayer gaming platform. The backend handles WebSocket connections for live gameplay, player management, game scheduling, and provides APIs for smooth interactions between players.

## Table of Contents
- [About OG Games Backend](#about-og-games-backend)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Server Locally](#running-the-server-locally)
- [Contributing](#contributing)
  - [Creating Issues](#creating-issues)
  - [Creating Pull Requests (PRs)](#creating-pull-requests-prs)
- [License](#license)

## About OG Games Backend

The **OG Games backend** provides:
- Real-time WebSocket connections for live multiplayer gameplay.
- RESTful API endpoints for player management, game status, and scheduling.
- A secure environment for player authentication and data handling.

The backend is built with **NestJS**, leveraging its modular architecture for a scalable and efficient codebase.

## Tech Stack

- **NestJS** - A progressive Node.js framework for building scalable server-side applications.
- **Redis** - Job scheduling for games.
- **WebSockets** - Enables real-time communication with the frontend.
- **TypeScript** - Enhances code readability and maintainability.
- **Database** - We're using PostGreSQL here.

## Getting Started

To set up the Chessmate backend locally, follow these steps.

### Prerequisites

Ensure you have the following installed:

- **Node.js** (v16 or above)
- **npm** or **yarn**
- **Redis** [Download here](https://redis.io/docs/latest/operate/oss_and_stack/install/install-redis/)

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/Build-Squad/solgames-backend.git
cd solgames-backend
npm install
# or
yarn install
```

### Running the Server Locally

1. **Database Setup**: Start the database server and make sure you've a database named 'web3_chess' on your running postgres server.
2. Configure your environment variables by creating a `.env` file in the root directory and copy paste the content from `.env.example` in the root directory.
3. Make sure your redis server is running, to check run `redis-cli` in your terminal and see if it's running.
4. For escrow API keys, contact the admin of the repository.
5. For PLATFORM_KEYS, you can create a new solana wallet and put in some SOL that'll be used as gas fee while creating games (creating escrow).

6. Start the backend server:

   ```bash
   npm run start:dev
   # or
   yarn start:dev
   ```

7. Your server should now be running at [http://localhost:3001](http://localhost:3001).

## Contributing

We welcome contributions to Chessmate! Here’s how you can help:

### Creating Issues

1. Go to the [Issues](https://github.com/Build-Squad/solgames-backend/issues) tab.
2. Click on **New Issue**.
3. Provide a clear title and detailed description.
4. Tag the issue with appropriate labels like **bug**, **enhancement**, or **documentation**.
5. Submit the issue for review.

### Creating Pull Requests (PRs)

1. **Fork** the repository to your GitHub account.
2. Clone your forked repository to your local machine.
3. Create a new branch for your feature or bugfix from dev branch, make sure you're using "contrib/" if you're contributing open-source:
   ```bash
   git checkout dev
   git checkout -b contrib/new-branch-name
   ```
4. Make your changes and test them thoroughly.
5. Commit your changes with a descriptive commit message.
6. Push your branch to your forked repository:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Open A PR and provide a clear title and description of your changes in the PR.
8. Submit the PR, and a maintainer will review it soon.

**Note:** Please follow the coding standards and add relevant comments to your code. If adding a new feature, make sure it aligns with the existing UI/UX of the game.

## License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more details.
