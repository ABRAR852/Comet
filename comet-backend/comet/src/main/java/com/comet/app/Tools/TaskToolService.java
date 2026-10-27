package com.comet.app.Tools;
import com.comet.app.Entity.Task;
import com.comet.app.Repository.TaskRepository;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;

@Service
public class TaskToolService {

    private final TaskRepository taskRepository;

    public TaskToolService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    private static boolean has(String s){
        return s != null && !s.isBlank() && s.equalsIgnoreCase("null");
    }

    @Tool(name = "Add-task", description = """
                Create a task or reminder. Call immediately on "remind me", "I need to", \\
                "don't forget", or any deadline. Don't ask permission. \\
                If no date or time was given, ask ONE short question for it. \\
                If the user already answered, declines, or ignores the question, create the task \\
                without dueAt. Never ask for the date twice.""")
    public ResponseEntity<?> addTask (@ToolParam(description = "Short task title, e.g. 'Pay rent'") String task,
                                   @ToolParam(description = "Short task notes or context eg: pay rent to tom with compensation", required = false) String task_description,
                                   @ToolParam(description = "Due date-time, ISO 8601 with offset, e.g. 2026-11-01T09:00:00+05:30. Omit if the user gave none."
                                           , required = false) String dueAt){
        try {
            OffsetDateTime due = null;
            Task newTask = new Task();

            if(has(dueAt)){
                try {
                    due = OffsetDateTime.parse(dueAt);
                    newTask.setDueAt(due);
                } catch (DateTimeParseException e) {
                    return new ResponseEntity<>("Invalid dueAt '" + dueAt + "'. Use ISO 8601 with offset, e.g. 2026-11-01T09:00:00+05:30.",
                            HttpStatus.NOT_ACCEPTABLE);
                }
            }

            newTask.setTask(task);
            newTask.setTaskDescription(task_description);

            return taskRepository.addTask(newTask);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Tool(name = "Get-tasklist", description = "This tool is for getting all tasks list from database")
    public ResponseEntity<?> getTasks (){
        try {
            return taskRepository.getTasks();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Tool(name = "Get-tasklistWithId", description = "This tool is for getting all tasks list with task id from database")
    public ResponseEntity<?> getTasksWithId (){
        try {
            return taskRepository.getTasksWithId();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Tool(name = "Delete-task", description = "This tool performs deletion of task this tool requires exact task id " +
            "if don't have just call Get-tasklistWithId tool first then extract the id from JSON response and then perform this tool")
    public ResponseEntity<?> deleteTask(int id){
        try {
            return taskRepository.deleteTask(id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
