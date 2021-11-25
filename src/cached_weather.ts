import NodeCache from "node-cache"
import { openweather } from "./openweather"
import { Weather } from "./types"

const CACHE_TIME: number = process.env.DEFAULT_CACHE_TIME ? parseInt(process.env.DEFAULT_CACHE_TIME) : 600

const cache = new NodeCache()

const { getStats, flushAll } = cache

export { getStats, flushAll }

export function forLocation(location: string): Promise<Weather> {
    return new Promise((resolve) => {
        const weather: Weather | undefined = cache.get(location)

        if ( weather == undefined ) {
            openweather(location).then(function(data) {
                if (data.statusCode == 200) {
                    cache.set(location, data, CACHE_TIME)
                }
                resolve(data)
            })
        } else {
            resolve(weather)
        }
    })
}
