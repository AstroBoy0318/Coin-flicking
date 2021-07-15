const mysql = require("mysql2");

const pool = mysql.createPool({
    connectionLimit: 5,
    host: "localhost",
    user: "root",
    database: "midas",
    password: ""
});
function emptyOrRows(rows) {
    if (!rows) {
        return [];
    }
    return rows;
}
function getTopList(type, date, limit ,res) {
    let where = `DATE_FORMAT(ctime,'%Y-%m')=DATE_FORMAT('` + date + `','%Y-%m')`;
    switch (type) {
        case 'week':
            where += ` and WEEKOFYEAR(ctime)=WEEKOFYEAR('` + date + `')`;
            break;
        case 'day':
            where = `DATE_FORMAT(ctime,'%Y-%m-%d')=DATE_FORMAT('` + date + `','%Y-%m-%d')`;
            break;
    }
    pool.query(
        `SELECT * FROM coinflip_history where reward > 0 and `+ where + ` order by reward desc LIMIT 0,?`,
        [ parseInt(limit) ], (err, rows)=>{
            data = emptyOrRows(rows);
            res.json(data);
        }
    );
}

function insertRow(name, avatar, bet, reward) {
    pool.query(
        "insert into coinflip_history (`name`,`avatar`,`bet`,`reward`,`ctime`) values ( ?, ?, ?, ?, now())", 
        [name, avatar, bet, reward]
    );
}

module.exports = {
    getTopList,
    insertRow
}