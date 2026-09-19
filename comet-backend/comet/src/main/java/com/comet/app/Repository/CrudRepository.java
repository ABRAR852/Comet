package com.comet.app.Repository;
import com.comet.app.Entity.Task;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public class CrudRepository {

    private final JdbcTemplate jdbcTemplate;

    public CrudRepository(JdbcTemplate jdbcTemplate) {
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


    public ResponseEntity<?> addTask (Task task){
        try {
            if (task.getTask() != null && task.getTaskDescription() != null){
                int update = jdbcTemplate.update("INSERT INTO Todo_list (task, task_description) " +
                        "VALUES (?, ?)", task.getTask(), task.getTaskDescription());
                if(update >= 1){
                    return new ResponseEntity<>("Task " + task.getTask() + " add", HttpStatus.CREATED);
                }else {
                    return new ResponseEntity<>("Can't add "+ task.getTask(), HttpStatus.NOT_MODIFIED);
                }
            }else {
                return new ResponseEntity<>("Enter valid data to add task.", HttpStatus.NOT_ACCEPTABLE);
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public ResponseEntity<?> getTasks () {
        try {
            String sql = "SELECT date_time, task, task_description, task_done FROM todo_list";
            List<Task> tasks = jdbcTemplate.query(sql, (rs, rowNum) -> {
                Task task = new Task();
                task.setDateTime(rs.getObject("date_time", OffsetDateTime.class));
                task.setTask(rs.getString("task"));
                task.setTaskDescription(rs.getString("task_description"));
                task.setTaskDone(rs.getBoolean("task_done"));
                return task;
            });
            if (!tasks.isEmpty()){
                return ResponseEntity.ok(tasks);
            }else {
                return new ResponseEntity<>("No tasks found", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public ResponseEntity<?> getTasksWithId () {
        try {
            String sql = "SELECT id, date_time, task, task_description, task_done FROM todo_list";
            List<Task> tasks = jdbcTemplate.query(sql, (rs, rowNum) -> {
                Task task = new Task();
                task.setId(rs.getInt("id"));
                task.setDateTime(rs.getObject("date_time", OffsetDateTime.class));
                task.setTask(rs.getString("task"));
                task.setTaskDescription(rs.getString("task_description"));
                task.setTaskDone(rs.getBoolean("task_done"));
                return task;
            });
            if (!tasks.isEmpty()){
                return ResponseEntity.ok(tasks);
            }else {
                return new ResponseEntity<>("No tasks found", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public ResponseEntity<?> deleteTask (int id){
        try {
            String sql = "DELETE FROM todo_list WHERE id = ?";
            int update = jdbcTemplate.update(sql, id);
            if(update > 0){
                return new ResponseEntity<>("Task deleted", HttpStatus.FOUND);
            }else{
                return new ResponseEntity<>("No Task found!", HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
