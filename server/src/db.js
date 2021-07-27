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
function getTopList(type, date, limit ,socket) {
    let where = `DATE_FORMAT(ctime,'%Y-%m')=DATE_FORMAT('` + date + `','%Y-%m')`;
    switch (type) {
        case 'month':
            where = ` 1=1`;
            break;
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
            let data = emptyOrRows(rows);
            socket.emit("highscore",{ type: type, data: data });
        }
    );
}
function getHighScore(socket)
{
    pool.query(
        `SELECT max(reward) as highscore FROM coinflip_history`, (err, rows)=>{
            let data = emptyOrRows(rows);
            let highscore = 0;
            if(data.length > 0)
            {
                highscore = data[0].highscore;
            }
            socket.emit("highscore",{ value: highscore });
        }
    );
}
function insertRow(name, avatar, bet, reward) {
    pool.query(
        "insert into coinflip_history (`name`,`avatar`,`bet`,`reward`,`ctime`) values ( ?, ?, ?, ?, now())", 
        [name, avatar, bet, reward]
    );
}
function getTotalBnb(res)
{
    pool.query(
        `SELECT sum(bet) as totalbnb FROM coinflip_history`, (err, rows)=>{
            let data = emptyOrRows(rows);
            let totalbnb = 0;
            if(data.length > 0)
            {
                totalbnb = data[0].totalbnb;
            }
            res.send('<b>'+totalbnb+'</b>');
        }
    );
}

module.exports = {
    getTopList,
    getHighScore,
    insertRow,
    getTotalBnb
}