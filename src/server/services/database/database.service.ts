/**
 * @module server
 */
/** End Typedoc Module Declaration */
import { Injectable } from '@angular/core';
import { createConnection, CreateConnectionOptions, Connection, Driver } from 'typeorm';
import * as SQL from 'sql-template-strings';
import { LogLevel, Logger } from '../../../common/services/logger.service';
import { Service } from '../../../common/registry/decorators';
import { AbstractService } from '../../../common/services/service';
import { registry } from '../../../common/registry/entityRegistry';

export interface DatabaseLogFunction {
  (level: LogLevel, ...messages: any[]): void;
}

/**
 * Core database service for connecting to the SQL db
 */
@Injectable()
@Service()
export class Database extends AbstractService {

  /**
   * The current connection instance
   */
  protected connection: Connection;

  /**
   * Logger instance for the class, initialized with `database` source
   */
  private logger: Logger;

  /**
   * Promise that the database has initialised.
   */
  private initialized: Promise<this>;

  constructor(loggerBase: Logger) {
    super();
    this.logger = loggerBase.source('database');

    this.initialized = this.initialize();
  }

  /**
   * Connects to the database and stores reference to the connection instance
   * @returns {Promise<Database>}
   */
  public initialize(): Promise<this> {
    return Database.connect((level: LogLevel, message: any) => this.logger[level](message))
      .then((c) => {
        this.connection = c;
        return this;
      })
      .catch((e) => {
        this.logger.critical(e);
        throw e;
      });
  }

  /**
   * Connect to the datatbase, returning promised of connection instance.
   * Static method so calls can be made outside of dependency injection context for example
   * pre-bootstrap
   * @param logFunction
   * @returns {Promise<Connection>}
   */
  public static connect(logFunction?: DatabaseLogFunction): Promise<Connection> {

    logFunction('info', 'Connecting to database');

    const options: CreateConnectionOptions = {
      driver: process.env.DB_DRIVER, // Right now only "mysql" is supported
      connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        autoSchemaCreate: false, // if set to true, then database schema will be automatically
        // created on each application start
        logging: {
          logger: (message: any, level: 'log'|'debug'|'info'|'error'): void => {
            if (level == 'log') {
              level = 'info';
            }
            logFunction((level as LogLevel), message)
          },
          logQueries: true,
        }
      },
      entities: [
        ...registry.getAllOfType('model')
          .values()
      ],
    };

    return createConnection(options);

  }

  /**
   * Retrieve connection isntance
   * @returns {Promise<Connection>}
   */
  public getConnection(): Promise<Connection> {
    return this.initialized.then(() => this.connection);
  }

  /**
   * Execute a raw query
   * @param sql
   * @returns {Promise<any>}
   */
  public query(sql: string): Promise<any> {
    return this.getDriver()
      .then((driver: Driver) => driver.query(sql));
  }

  /**
   * Get current driver from connection for direct database interaction
   * @returns {Promise<Driver>}
   */
  public getDriver(): Promise<Driver> {
    return this.initialized.then(() => this.connection.driver);
  }

  /**
   * ES6 template string tagger to create prepared statements
   *
   * Example:
   * ```typescript
   * return this.database.query(Database.prepare`INSERT
   * INTO    books
   * (name, author, isbn, category, recommended_age, pages, price)
   * VALUES  (${name}, ${author}, ${isbn}, ${category}, ${recommendedAge}, ${pages}, ${price})
   * `);
   * ```
   * This will generate a prepared statement with all the safety features that come with that
   * @see https://www.npmjs.com/package/sql-template-strings
   * @param args
   * @returns {any}
   */
  public static prepare(...args:any[]):any {
    return (SQL as any)(...args);
  }

}

