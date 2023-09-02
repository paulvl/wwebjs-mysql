const fs = require('fs');

class MysqlStore {
    constructor({ pool, tableInfo } = {}) {
        if(!pool) throw new Error('A valid MySQL Connection Pool is required for MysqlStore.');
        if(!tableInfo) throw new Error('A valid Table Information is required for MysqlStore.');
        this.pool = pool;
        this.tableInfo = tableInfo;
    }

    async sessionExists(options) {
        const connection = await this.pool.getConnection();
        const [rows] = await connection.execute( `SELECT COUNT(*) as count FROM \`${this.tableInfo.table}\` WHERE \`${this.tableInfo.session_column}\` = ?`, [options.session]);
        connection.release();
        return rows[0].count > 0;
    }

    async save(options) {
        const connection = await this.pool.getConnection();
        const fileBuffer = fs.readFileSync(`${options.session}.zip`);
        const [rows] = await connection.execute( `SELECT  as count FROM \`${this.tableInfo.table}\` WHERE \`${this.tableInfo.session_column}\` = ?`, [options.session]);
        if (rows[0].count == 0) {
            await connection.execute(`INSERT INTO \`${this.tableInfo.table}\` (\`${this.tableInfo.session_column}\`, \`${this.tableInfo.data_column}\`) VALUES (?, ?)`, [options.session, fileBuffer]);
        } else {
            await connection.execute(`UPDATE \`${this.tableInfo.table}\` SET \`${this.tableInfo.data_column}\` = ? WHERE \`${this.tableInfo.session_column}\` = ?`, [fileBuffer, options.session]);
        }
        connection.release();
    }

    async extract(options) {
        const connection = await this.pool.getConnection();
        const [rows] = await connection.execute(`SELECT \`${this.tableInfo.data_column}\` FROM \`${this.tableInfo.table}\` WHERE \`${this.tableInfo.session_column}\` = ?`, [options.session]);
        if (rows.length) {
            fs.writeFileSync(options.path, rows[0].data);
        }
        connection.release();
    }

    async delete(options) {
        const connection = await this.pool.getConnection();
        await connection.execute(`DELETE FROM \`${this.tableInfo.table}\` WHERE \`${this.tableInfo.session_column}\` = ?`, [options.session]);
        connection.release();
    }
}

module.exports = MysqlStore;
