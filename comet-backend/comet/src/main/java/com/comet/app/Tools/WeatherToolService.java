package com.comet.app.Tools;

import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
public class WeatherToolService {

    private RestClient restClient;

    public WeatherToolService(RestClient.Builder restClientBuilder) {
        this.restClient = restClientBuilder.build();
    }

    @Tool(name = "Real-time-weather", description = "Get real-time city weather and temperature for given city")
    public String getWeather(@ToolParam(description = "Enter city name to get real-time weather eg; Hyderabad") String cityName){
        try {

            Map<String, Object> geoResponse = restClient.get()
                    .uri("https://geocoding-api.open-meteo.com/v1/search",
                            uriBuilder -> uriBuilder
                                    .queryParam("name", cityName)
                                    .queryParam("count", 1)
                                    .build())
                    .retrieve().body(Map.class);

            if(geoResponse == null || geoResponse.isEmpty()) return "couldn't find city coordinates!";


            List<Map<String, Object>> results = (List<Map<String, Object>>) geoResponse.get("results");

            Map<String, Object> coordinates = results.get(0);
            Double lat = (Double) coordinates.get("latitude");
            Double lon = (Double) coordinates.get("longitude");

            Map<String, Object> weatherResponse = restClient.get()
                    .uri("https://api.open-meteo.com/v1/forecast", uriBuilder -> uriBuilder
                            .queryParam("latitude", lat)
                            .queryParam("longitude", lon)
                            .queryParam("current", "temperature_2m,apparent_temperature,precipitation,weather_code")
                            .queryParam("daily", "temperature_2m_max,temperature_2m_min,uv_index_max,precipitation_probability_max")
                            .queryParam("forecaste_days", 2)
                            .queryParam("timezone", "auto")
                            .build()
                    ).retrieve().body(Map.class);

            if(weatherResponse == null || weatherResponse.isEmpty()) return "Current weather not found for " + cityName;

            System.out.println("WEATHER : " + weatherResponse);

            Map<String, Object> AQI = restClient.get().uri(
                            "https://air-quality-api.open-meteo.com/v1/air-quality", uriBuilder -> uriBuilder
                                    .queryParam("latitude", lat)
                                    .queryParam("longitude", lon)
                                    .queryParam("current", "us_aqi,pm2_5,pm10")
                                    .build())
                    .retrieve().body(Map.class);

            Map<String, Object> currentWeather = (Map<String, Object>) weatherResponse.get("current");
            Map<String, Object> dailyWeather = (Map<String, Object>) weatherResponse.get("daily");
            Map<String, Object> currentAQI = (Map<String, Object>) AQI.get("current");

            List<Double> maxTemp = (List<Double>) dailyWeather.get("temperature_2m_max");
            List<Double> minTemp = (List<Double>) dailyWeather.get("temperature_2m_min");
            List<Double> uvMax = (List<Double>) dailyWeather.get("uv_index_max");
            List<Integer> rainProb = (List<Integer>) dailyWeather.get("precipitation_probability_max");

            return String.format("""
            Weather for %s:
            - Current Temp: %s°C (Real Feel: %s°C)
            - Rain Chance Today: %s%%
            - UV Index Max: %s
            - Air Quality Index (US AQI): %s (PM2.5: %s µg/m³)
            - Tomorrow's Forecast: High %s°C / Low %s°C (Rain Chance: %s%%)
            """,
                    cityName,
                    currentWeather.get("temperature_2m"), currentWeather.get("apparent_temperature"),
                    rainProb.get(0),
                    uvMax.get(0),
                    currentAQI.get("us_aqi"), currentAQI.get("pm2_5"),
                    maxTemp.get(1), minTemp.get(1), rainProb.get(1)
            );

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
