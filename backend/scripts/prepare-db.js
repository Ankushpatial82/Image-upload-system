const fs = require('fs');
const path = require('path');

const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
const postgresSchemaPath = path.resolve(__dirname, '../prisma/schema.postgresql.prisma');

const dbUrl = process.env.DATABASE_URL || '';

if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
  console.log('🐘 Detected PostgreSQL DATABASE_URL. Switching Prisma provider to postgresql...');
  if (fs.existsSync(postgresSchemaPath)) {
    fs.copyFileSync(postgresSchemaPath, schemaPath);
  }
} else {
  console.log('📁 Using local SQLite database configuration...');
}
