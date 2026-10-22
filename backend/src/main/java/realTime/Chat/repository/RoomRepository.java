package realTime.Chat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import realTime.Chat.entity.Room;

@Repository
public interface RoomRepository extends JpaRepository<Room,Long>{
	Room findByName(String name);
	List<Room> findByMembers_Id(Long userId);
}
