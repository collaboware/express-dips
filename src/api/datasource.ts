import { DataSource } from 'typeorm'

export const IPSDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'ips',
  entities: [__dirname + '/**/model.{js,ts}'],
  migrations: [__dirname + '/migrations/*.{js,ts}'],
  migrationsTableName: 'custom_migration_table',
})
