var fs = require('fs');
var mysql = require('mysql');
var qlsql = require('ql-sql');
class Driver {
	constructor(data, schema) {
		this.data = data;
		this.schema = schema;
	}
	connect(callback) {
		this.type = require('ql').parse(fs.readFileSync(this.schema, 'utf8'), 'Declarations');
		this.type = require('ql/Type.compile')(this.type);
		this.connection = mysql.createConnection(this.data);
		this.connection.connect(callback);
	}
	query(ql) {
		var { Scope, Environment } = require('ql');
		var ql = require('ql').parse(ql);
		var environment = new Environment(
			Object.assign(
				new Scope({}),
				{ type: this.type }
			)
		);
		var sql = require('ql').compile.call(environment, ql, qlsql);
		sql = require('sql').generate(sql);
		return new Promise((resolve, reject) => {
			this.connection.query(sql, function (error, results) {
				if (error) reject(error);
				else resolve(results);
			});
		});
	}
	disconnect(callback) {
		this.connection.end(callback);
	}
}
module.exports = Driver;
