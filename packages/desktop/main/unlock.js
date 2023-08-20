const match =  require('@unblockneteasemusic/server');
var querystring = require("querystring");
const http = require('http');
const url = require('url');
const { read } = require('fs');
const exp = require('constants');
import { isDev } from '@/desktop/main/env'

const port = isDev ? 10660 : process.env.UNBLOCK_SERVER_PORT
const hostname = "localhost"

// QQ_COOKIE="uin=2597922741; qm_keyst=Q_H_L_5-NSakY6xqOnZ_I7Wflus2Dg9KeQ2svFAqFsVHZYcXxYCzmHgg352EQ"


function startUnlockServer() {
    // https://music.163.com/song?id=186145&userid=308757377
    const server = http.createServer(async (req, res) => {
        var urlObj = url.parse(req.url);
        if (urlObj.pathname == "/unblockneteasemusic" && req.method == "GET") {

            var query = urlObj.query;
            var queryObj = querystring.parse(query);
            
            console.log(queryObj);
            if (queryObj["track_id"] == null) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'text/json');
                res.end("param invalid: mission track_id");
                return
            }
            try {
                let tarckID = queryObj["track_id"]

                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/json');
                
                let resp = null 
        
                const unlockResponse = match(tarckID, ['qq', 'kuwo', 'migu','kugou','joox'])
                await unlockResponse.then((value) => {
                    resp = value
                }).catch((reason) => {
                    console.log(reason);
                });
                res.end(JSON.stringify(resp));
            } catch (err) {
                res.end(JSON.stringify(err.toString()));
            }
        }
    })

    server.listen(port, () => {
        console.log(`[UNLOCK] 服务器运行在 http://${hostname}:${port}/`);
    });
}

export {
    startUnlockServer
}