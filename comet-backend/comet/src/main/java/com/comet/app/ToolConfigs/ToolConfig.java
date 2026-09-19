package com.comet.app.ToolConfigs;
import com.comet.app.Tools.TaskToolService;
import com.comet.app.Tools.WeatherToolService;
import com.comet.app.Tools.WebSearchToolService;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ToolConfig {

    @Bean
    public ToolCallbackProvider webSearchTool (WebSearchToolService webSearchToolService,
                                               TaskToolService taskToolService,
                                               WeatherToolService weatherToolService) {
        return MethodToolCallbackProvider.builder().toolObjects(webSearchToolService,
                taskToolService,
                weatherToolService).build();
    }
}
