steps to initialize prisma

- pnpm install prisma
- npx prisma init
- define your schema
- get yourself a DB URL and paste it in .env
- npx prisma migrate dev --name migration_name
- npx prisma generate