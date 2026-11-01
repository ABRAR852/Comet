package com.comet.app.Repository;
import com.comet.app.Entity.Task;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Repository
public class TaskRepository {

    private final JdbcTemplate jdbcTemplate;

    public TaskRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public String createTable(){
        try {
            jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS Todo_list " +
                    "(id SERIAL PRIMARY KEY, date_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP, " +
                    "task VARCHAR(40), task_description TEXT, task_done BOOLEAN DEFAULT FALSE)"); // TZ* for adding time with timezone
            return "TABLE CREATED.";
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }


    public String addTask (Task task){
        try {
            if (task.getTask() != null && task.getTaskDescription() != null){
                int update = jdbcTemplate.update("INSERT INTO Todo_list (task, task_description, due_at) " +
                        "VALUES (?, ?, ?)", task.getTask(), task.getTaskDescription(), task.getDueAt());
                if(update >= 1){
                    return "Task :" + task.getTask() + " add";
                }else {
                    return "Can't add "+ task.getTask();
                }
            }else {
                return "Enter valid data to add task.";
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<Task> getTasks () {
        try {
            String sql = "SELECT id, date_time, task, task_description, task_done, due_at FROM todo_list";
            return jdbcTemplate.query(sql, (rs, rowNum) -> {
                Task task = new Task();
                task.setId(rs.getInt("id"));
                task.setDateTime(rs.getObject("date_time", OffsetDateTime.class));
                task.setTask(rs.getString("task"));
                task.setTaskDescription(rs.getString("task_description"));
                task.setTaskDone(rs.getBoolean("task_done"));
                task.setDueAt(rs.getObject("due_at", OffsetDateTime.class));
                return task;
            });

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public String deleteTask (int id){
        try {
            String sql = "DELETE FROM todo_list WHERE id = ?";
            int update = jdbcTemplate.update(sql, id);
            if(update > 0){
                return "Task deleted";
            }else{
                return "No Task found!";
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
