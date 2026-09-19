package com.comet.app.Tools;
import com.comet.app.Entity.Task;
import com.comet.app.Repository.CrudRepository;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

@Service
public class TaskToolService {

    private final CrudRepository crudRepository;

    public TaskToolService(CrudRepository crudRepository) {
        this.crudRepository = crudRepository;
    }

    @Tool(name = "Add-task", description = "This tool is for adding task into list")
    public ResponseEntity<?> addTask (@ToolParam(description = "Add task name here") String task,
                                   @ToolParam(description = "Add task task description here for better context") String task_description){
        try {
            Task taskEntity = new Task();
            taskEntity.setTask(task);
            taskEntity.setTaskDescription(task_description);

            return crudRepository.addTask(taskEntity);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Tool(name = "Get-tasklist", description = "This tool is for getting all tasks list from database")
    public ResponseEntity<?> getTasks (){
        try {
            return crudRepository.getTasks();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Tool(name = "Get-tasklistWithId", description = "This tool is for getting all tasks list with task id from database")
    public ResponseEntity<?> getTasksWithId (){
        try {
            return crudRepository.getTasksWithId();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Tool(name = "Delete-task", description = "This tool performs deletion of task this tool requires exact task id " +
            "if don't have just call Get-tasklistWithId tool first then extract the id from JSON response and then perform this tool")
    public ResponseEntity<?> deleteTask(int id){
        try {
            return crudRepository.deleteTask(id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
