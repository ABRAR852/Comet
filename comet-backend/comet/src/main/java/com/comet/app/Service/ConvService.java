package com.comet.app.Service;
import com.comet.app.Entity.ConversationDTO;
import com.comet.app.Repository.ConvRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ConvService {

    private final JdbcTemplate jdbcTemplate;
    private final ConvRepository convRepository;

    public ConvService(JdbcTemplate jdbcTemplate,
                       ConvRepository convRepository) {
        this.jdbcTemplate = jdbcTemplate;
        this.convRepository = convRepository;
    }

    public ResponseEntity<?> getAllConv(){
        try {
            List<ConversationDTO> allConv = convRepository.getAllConv();
            if(!allConv.isEmpty()){
                return new ResponseEntity<>(allConv, HttpStatus.OK);
            }return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
