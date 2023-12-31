# wwebjs-mysql
A MySQL plugin for whatsapp-web.js! 

Use MysqlStore to save your WhatsApp MultiDevice session on a MySQL Database.

## Quick Links

* [Guide / Getting Started](https://wwebjs.dev/guide/authentication.html)
* [GitHub](https://github.com/paulvl/wwebjs-mysql)
* [npm](https://www.npmjs.com/package/wwebjs-mysql)

## Installation

The module is now available on npm! `npm i wwebjs-mysql`

## Example MySQL Table statement

```sql
CREATE TABLE `wsp_sessions` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `session_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data` mediumblob,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `wsp_sessions_session_name_unique` (`session_name`)
) 
```

## Example usage

```js
const { Client, RemoteAuth } = require('whatsapp-web.js');
const { MysqlStore } = require('wwebjs-mysql');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_MYSQL_HOST,
    user: process.env.DB_MYSQL_USER,
    password: process.env.DB_MYSQL_PASSWORD,
    database: process.env.DB_MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,  // max number of concurrent conections
    queueLimit: 0         // max number of conections on queue (0 = limitless)
});

const tableInfo = {
    table: 'wsp_sessions',
    session_column: 'session_name',
    data_column: 'data',
    updated_at_column: 'updated_at'
}

const store = new MysqlStore({ pool: pool, tableInfo: tableInfo })

const client = new Client({
    authStrategy: new RemoteAuth({
        store: store,
        backupSyncIntervalMs: 300000,
        session: 'your-session-name'
    })
});

client.initialize();
```

## Delete Remote Session

How to force delete a specific remote session on the Database:

```js
await store.delete({session: 'your-session-name'});
```