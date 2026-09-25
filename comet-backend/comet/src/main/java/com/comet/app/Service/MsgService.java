package com.comet.app.Service;
import com.comet.app.Entity.MessageDTO;
import com.comet.app.Repository.MsgRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MsgService {

    private final MsgRepository msgRepository;

    public MsgService(MsgRepository msgRepository) {
        this.msgRepository = msgRepository;
    }

    public ResponseEntity<?> getMessagesByConvId (String convId) {
        try {
            List<MessageDTO> msgByConvId = msgRepository.getMsgByConvId(convId);
            if(!msgByConvId.isEmpty()){
                return new ResponseEntity<>(msgByConvId, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
