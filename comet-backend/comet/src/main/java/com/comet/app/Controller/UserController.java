package com.comet.app.Controller;
import com.comet.app.Entity.MessageDTO;
import com.comet.app.Entity.Task;
import com.comet.app.Repository.ConvRepository;
import com.comet.app.Repository.CrudRepository;
import com.comet.app.Repository.MsgRepository;
import com.comet.app.Service.AiService;
import com.comet.app.Service.ConvService;
import com.comet.app.Service.MsgService;
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
    private final ConvRepository convRepository;
    private final WeatherToolService weatherToolService;
    private final ConvService convService;
    private final MsgService msgService;
    public UserController(AiService aiMessageService,
                          CrudRepository crudRepository,
                          MsgRepository msgRepository, ConvRepository convRepository,
                          WeatherToolService weatherToolService, ConvService convService,
                          MsgService msgService) {
        this.aiMessageService = aiMessageService;
        this.crudRepository = crudRepository;
        this.msgRepository = msgRepository;
        this.convRepository = convRepository;
        this.weatherToolService = weatherToolService;
        this.convService = convService;
        this.msgService = msgService;
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

    @PostMapping("/create-convTable")
    public String createConvTable(){
        try {
            return convRepository.createTable();
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

    @GetMapping("/get-conv")
    public ResponseEntity<?> getConversations(){
        try {
            ResponseEntity<?> allConv = convService.getAllConv();
            return new ResponseEntity<>(allConv.getBody(), allConv.getStatusCode());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GetMapping("/get-msg/{convId}")
    public ResponseEntity<?> getMessages(@PathVariable String convId){
        try {
            ResponseEntity<?> messagesByConvId = msgService.getMessagesByConvId(convId);
            return new ResponseEntity<>(messagesByConvId.getBody(), messagesByConvId.getStatusCode());
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
