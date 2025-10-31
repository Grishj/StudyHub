Markdown

# PSC Study App - Backend API

## Setup

1. Install dependencies:
```bash
npm install
Setup environment variables:
Bash

cp .env.example .env
# Edit .env with your configuration
Setup database:
Bash

npx prisma migrate dev
npx prisma generate
npm run prisma:seed
Run development server:
Bash

npm run dev