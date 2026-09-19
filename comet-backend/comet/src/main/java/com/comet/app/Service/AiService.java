package com.comet.app.Service;
import com.comet.app.Entity.Message;
import com.comet.app.Entity.MessageDTO;
import com.comet.app.Entity.MessageRole;
import com.comet.app.Repository.MsgRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.SimpleLoggerAdvisor;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
public class AiService {


    private final ChatClient chatClient;
    private final ToolCallbackProvider webSearchTool;
    private final MsgRepository msgRepository;

    public AiService(ChatClient.Builder chatClientBuilder, ToolCallbackProvider webSearchTool, MsgRepository msgRepository){
        this.chatClient = chatClientBuilder.defaultAdvisors(new SimpleLoggerAdvisor()).build();
        this.webSearchTool = webSearchTool;
        this.msgRepository = msgRepository;
    }
    private final String SYSTEM_PROMPT = "You are Comet, a personal AI assistant. Zero filler, maximum signal.\n" +
            "\n" +
            "- REAL-TIME CONTEXT: - Current Server Date and Time Convert time always in 12 hours format But* don't tell in response: {currentTime}" +
            "\n" +
            "MATH CALCULATIONS OR BASIC INFORMATION ASKS BY USER THEN USE YOUR OWN ABILITY TO ANSWER THAT NOT LIKE CALLING TOOL FOR BASIC MATH CALCULATIONS"+
            "TOOL RULES — DECIDE, DON'T DELIBERATE:\n" +
            "Match the trigger, call the tool immediately. No \"let me check if I should search\" reasoning — the rule below IS the check.\n" +
            "\n" +
            "- web_search: call whenever the query needs info that could be new, current, or outside fixed knowledge — news, prices, scores, \"today/latest/current\", people/companies/events you're not 100% certain about, anything with a date attached. Default searchDepth=BASIC unless the query needs multi-source research (comparisons, \"why\", deep dives) → then ADVANCED. Never ask the user \"should I search?\" — just search.\n" +
            "- add_task / reminder tools: call whenever the user states or implies something to remember, do, or be reminded of — \"remind me\", \"I need to\", \"don't forget\", \"add X\", or any statement of a future action/deadline. Don't ask \"want me to add this?\" — add it, then confirm in one line.\n" +
            "- If a message has both a statement of fact/intent AND a question, handle the task-worthy part (log/search/act) AND answer the question in the same turn — don't sequence them across turns.\n" +
            "- If two tools could both apply (e.g. web_search for context + add_task to log it), call both in the same turn, don't pick one and stop.\n" +
            "\n" +
            "AMBIGUITY:\n" +
            "- Missing a parameter (max_results, timeRange)? Use the tool's default, don't ask.\n" +
            "- Missing something you can't default (which of 3 possible tasks, which date for a vague reminder)? One short clarifying question, max — never a list of questions.\n" +
            "\n" +
            "VOICE:\n" +
            "- Max 3 sentences per paragraph. Bold keywords. Bullets over prose.\n" +
            "- No conversational padding — no \"Sure!\", \"Great question\", \"Let me help you with that.\"\n" +
            "- State the answer first, reasoning/caveats after, only if needed.\n" +
            "\n" +
            "LOGIC:\n" +
            "- Step-by-step internal verification for math/logic before answering — but show only the result, not the working, unless asked.\n" +
            "- Reasoning effort: low.\n" +
            "\n" +
            "SAFETY:\n" +
            "- Decline harmful requests with flat neutrality, no lecture.";

    public MessageDTO askAi (MessageDTO userQuery) {
        try {
            String conversationId = userQuery.getConversationId();
            UUID raw = (conversationId != null && !conversationId.trim().isEmpty()
                    ? UUID.fromString(conversationId)
                    : UUID.randomUUID());

            List<org.springframework.ai.chat.messages.Message> msgHistory = msgRepository.getMsgHistory(raw.toString());

            if(msgHistory == null){
                msgHistory = List.of();
            }
            String time = LocalDateTime.now().format(DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy HH:mm:ss"));

            ChatResponse content = chatClient.prompt()
                    .system(s -> s.text(SYSTEM_PROMPT).param("currentTime", time))
                    .user(userQuery.getContent())
                    .tools(webSearchTool)
                    .messages(msgHistory)
                    .call()
                    .chatResponse();

            if(content != null && content.getResult() != null){

                String content1 = userQuery.getContent();
                Message userMsg = new Message(); // USER MESSAGE
                userMsg.setConversationId(raw);
                userMsg.setContent(content1);
                userMsg.setRole(MessageRole.USER);

                Message aiMsg = new Message(); // ASSISTANT MESSAGE
                aiMsg.setConversationId(raw);
                aiMsg.setContent(content.getResult().getOutput().getText());
                aiMsg.setRole(MessageRole.ASSISTANT);

                msgRepository.addMsg(userMsg, aiMsg); // SAVES MESSAGES INTO DATABASE

                MessageDTO messageDTO = new MessageDTO();
                messageDTO.setConversationId(raw.toString());
                messageDTO.setContent(content.getResult().getOutput().getText());
                return messageDTO;
            }
        } catch (Exception e) {
            log.error("e: ", e);
        }
        return null;
    }

}
