import axios from "axios"
import { Weather } from "./types"

const OWM_API_KEY: string = process.env.OWM_API_KEY || ""

async function getWeather(location: string) {
    const { data } = await axios.get(`https://api.openweathermap.org/geo/1.0/direct?q=${location}&limit=1&appid=${OWM_API_KEY}`)

    if ( data.length == 0 ) {
        throw {statusCode: 400, data: `Unable to find location: ${location}`}
    }

    const geo = data[0]

    try {
        const response = await axios(`https://api.openweathermap.org/data/3.0/onecall?lat=${geo.lat}&lon=${geo.lon}&exclude=minutely,hourly,alerts&units=imperial&appid=${OWM_API_KEY}`)
        return response
    } catch (error) {
        throw {statusCode: error.response.status, data: error.response.data.message}
    }
}

export function openweather(location: string): Promise<Weather> {
    console.log(`- requesting weather for ${location} from openweather`)

    return getWeather(location)
        .then(function(data) {
            return {statusCode: data.status, data: JSON.stringify(data.data)}
        }).catch(function(err) {
            return err
        })
}
