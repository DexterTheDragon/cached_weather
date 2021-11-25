import "dotenv/config"
import http from "http"
import { URL } from "url"
import { format } from "date-fns"
import * as cached_weather from "./cached_weather"

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 8000

const requestListener = function(request: http.IncomingMessage, response: http.ServerResponse) {
    const url = new URL(request.url || "", `http://${request.headers.host}`)

    switch(url.pathname) {
        case "/favicon.ico": {
            response.writeHead(404)
            response.end()
            break
        }
        case "/status": {
            response.writeHead(200)
            response.end(JSON.stringify(cached_weather.getStats()))
            break
        }
        case "/flush": {
            cached_weather.flushAll()
            response.writeHead(200)
            response.end("OK")
            break
        }
        default: {
            const location: string = url.searchParams.get("location") || process.env.DEFAULT_LOCATION || ""

            cached_weather.forLocation(location).then((data) => {
                response.writeHead(data.statusCode, { "Content-Type": "application/json" })
                response.end(data.data)
            })
        }
    }

    response.on("finish", () => {
        console.log(`${request.headers["x-forwarded-for"] || request.connection.remoteAddress} - - [${format(new Date(), "dd/MMM/yyyy:HH:mm:ss xx")}] "${request.method} ${request.url} HTTP/${request.httpVersion}" ${response.statusCode} -`)
    })

}

const server = http.createServer(requestListener)
server.listen(PORT, "0.0.0.0")

console.log("Server running on", PORT)
