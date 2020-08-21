import http from "http";
import url from "url";
import querystring from "querystring";
import {OAuth} from "oauth";

const PORT = process.env.PORT || 8080;
const YAHOO_APP_ID = process.env.YAHOO_APP_ID;

const oauth = new OAuth(
    "",
    "",
    process.env.YAHOO_CONSUMER_KEY || "",
    process.env.YAHOO_CONSUMER_SECRET || "",
    '1.0',
    null,
    'HMAC-SHA1',
    undefined,
    {
        "X-Yahoo-App-Id": YAHOO_APP_ID,
        "Accept": "application/json",
        "Connection": "close"
    }
);

const requestListener = function(request: http.IncomingMessage, response: http.ServerResponse) {
    const current_url = request.url || "";
    const query = url.parse(current_url).query || "";
    const qs = querystring.parse(query);

    oauth.get(
        `https://weather-ydn-yql.media.yahoo.com/forecastrss?location=${qs.location}&format=json`,
        "",
        "",
        function (err, data) {
            if (err) {
                console.log(`${request.connection.remoteAddress} - - [${Date.now()}] "${request.method} ${request.url} HTTP/${request.httpVersion}" ${err.statusCode} -`);
                response.writeHead(err.statusCode);
                const res = JSON.parse(err.data.toString());
                response.end(res["yahoo.error"]["yahoo.description"]);
            } else {
                console.log(`${request.connection.remoteAddress} - - [${Date.now()}] "${request.method} ${request.url} HTTP/${request.httpVersion}" 200 -`);
                response.writeHead(200);
                response.end(data);
            }
        }
    );
}

const server = http.createServer(requestListener);
server.listen(PORT);

console.log("Server running on", PORT);
