package com.comet.app.Tools;

import com.comet.app.Entity.SearchDepth;
import com.comet.app.Entity.TimeRange;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class WebSearchToolService {


    private final RestClient restClient;

    public WebSearchToolService(@Value("${tavilysearch.api-key}") String apiKey) {
        this.restClient = RestClient.builder()
                .baseUrl("https://api.tavily.com")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .defaultHeader("Content-Type", "Application/json")
                .build();
    }

    @Tool(name = "web_search", description = "Search the web for current, real-world facts or news.")
    public String webSearch (@ToolParam(description = "The target web search query") String query,
                             @ToolParam(description = "basic for fast lookups (~1s), advanced for deep research (~3-5s)") SearchDepth searchDepth,
                             @ToolParam(description = "Add boolean value if you want Ai include answer for example: true or false") boolean include_answer,
                             @ToolParam(description = "Max search results (default 3, max 5)", required = false) Integer max_results,
                             @ToolParam(description = "Optional time boundary: day, week, month, or year", required = false) TimeRange timeRange){
        try {

            Map<String, Object> body = new HashMap<>();
            body.put("query", query);
            body.put("search_depth", searchDepth.name().toLowerCase());
            body.put("include_answer", include_answer);
            body.put("max_results", max_results);

            if(timeRange != null){
                body.put("time_range", timeRange.name().toLowerCase());
            }

            Map<String, Object> response = restClient.post()
                    .uri("/search")
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            StringBuilder sb = new StringBuilder();

            String answer = (String) response.get("answer");
            if (answer != null && !answer.isEmpty()){
                sb.append("Direct Answer: ").append(answer).append("\n\n");// use to feed important in-depth context to AI
            }

            List<Map<String, Object>> webResults = (List<Map<String, Object>>) response.get("results");
            if(webResults != null){
                for(Map<String, Object> res : webResults){
                    sb.append("Title : ").append(res.get("title")).append("\n");
                    sb.append("URL : ").append(res.get("url")).append("\n");
                    sb.append("Content : ").append(res.get("content")).append("\n");// to feed web content to AI
                }
            }

            return sb.toString();

        } catch (RuntimeException e) {
            e.printStackTrace();
            return "Web search failed: " + e.getMessage();
        }

    }
}
