import { DataSource } from 'typeorm'

export const IPSDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'postgres',
  database: 'ips',
  entities: [__dirname + '/**/model.js'],
  migrations: [__dirname + '/migrations/*.js}'],
  migrationsTableName: 'custom_migration_table',
  migrationsRun: true,
  synchronize: true,
})
