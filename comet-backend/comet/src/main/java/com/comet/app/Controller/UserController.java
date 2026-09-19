package com.comet.app.Controller;
import com.comet.app.Entity.MessageDTO;
import com.comet.app.Entity.Task;
import com.comet.app.Repository.CrudRepository;
import com.comet.app.Repository.MsgRepository;
import com.comet.app.Service.AiService;
import com.comet.app.Tools.WeatherToolService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/User")
public class UserController {

    private final AiService aiMessageService;
    private final CrudRepository crudRepository;
    private final MsgRepository msgRepository;
    private final WeatherToolService weatherToolService;

    public UserController(AiService aiMessageService,
                          CrudRepository crudRepository,
                          MsgRepository msgRepository,
                          WeatherToolService weatherToolService) {
        this.aiMessageService = aiMessageService;
        this.crudRepository = crudRepository;
        this.msgRepository = msgRepository;
        this.weatherToolService = weatherToolService;
    }

    @PostMapping("/askQuery") // API for user queries
    public MessageDTO askQuery(@RequestBody MessageDTO userQuery){
        try {
            return aiMessageService.askAi(userQuery);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/create-table")
    public String createTable(){
        try {
            return crudRepository.createTable();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/create-msgTable")
    public String createMsgTable(){
        try {
            return msgRepository.createTable();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/add-task")
    public ResponseEntity<?> addTask(@RequestBody Task task){
        try {
            return crudRepository.addTask(task);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/get-tasks")
    public ResponseEntity<?> getTasks(){
        try {
            return crudRepository.getTasks();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/get-weather/{cityName}")
    public ResponseEntity<?> getWeather(@PathVariable String cityName){
        try {
            String weather = weatherToolService.getWeather(cityName);
            return new ResponseEntity<>(weather, HttpStatus.OK);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @PostMapping("/delete-task/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable int id){
        try {
            return crudRepository.deleteTask(id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
