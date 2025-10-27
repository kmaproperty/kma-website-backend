# TypeORM Migrations

This directory contains database migration files for managing schema changes.

## Available Commands

### Generate a Migration
Automatically generate a migration by comparing your entities with the current database:
```bash
npm run migration:generate src/migration/[MigrationName]
```

**Example:**
```bash
npm run migration:generate src/migration/CreateUsersTable
```

### Create a Migration
Create an empty migration file manually:
```bash
npm run migration:create src/migration/[MigrationName]
```

**Example:**
```bash
npm run migration:create src/migration/AddUserEmailIndex
```

### Run Migrations
Run all pending migrations:
```bash
npm run migration:run
```

### Revert Last Migration
Revert the last executed migration:
```bash
npm run migration:revert
```

### Show Migration Status
Check which migrations have been executed:
```bash
npm run migration:show
```

## Migration Best Practices

1. **Always review generated migrations** before running them in production
2. **Test migrations on development/staging** environments first
3. **Never edit executed migrations** - create a new migration to fix issues
4. **Use transactions** for data migrations when possible
5. **Backup your database** before running migrations in production
6. **Document complex migrations** with comments
7. **Create rollback strategies** for data migrations

## Workflow

### Development
1. Make changes to your entity files
2. Generate a migration: `npm run migration:generate src/migration/YourMigrationName`
3. Review the generated SQL in the migration file
4. Run the migration: `npm run migration:run`
5. Test your application

### Production
1. Pull the latest code with migration files
2. Build the application: `npm run build`
3. Run pending migrations: `npm run migration:run`
4. Restart the application

## Example Migration Structure

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class YourMigrationName1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Write your migration SQL here
    await queryRunner.query(`ALTER TABLE users ADD COLUMN email VARCHAR(255)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Write your rollback SQL here
    await queryRunner.query(`ALTER TABLE users DROP COLUMN email`);
  }
}
```

## Important Notes

- The migration files are automatically tracked in the `migrations` table in your database
- Migrations run in the order they were created (timestamp-based)
- Always implement both `up()` and `down()` methods for proper rollback support
