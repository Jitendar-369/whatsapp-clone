package realTime.Chat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import realTime.Chat.entity.Message;
import realTime.Chat.entity.Room;

@Repository
public interface MessageRepository extends JpaRepository<Message,Long>{
	List<Message> findByRoom(Room room);
	List<Message> findByRoomOrderByTimestampDesc(Room room);
	List<Message> findByRoomOrderByTimestampAsc(Room room);
	Message findTopByRoomOrderByTimestampDesc(Room room);
}
