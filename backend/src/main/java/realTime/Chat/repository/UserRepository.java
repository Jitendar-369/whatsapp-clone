package realTime.Chat.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import realTime.Chat.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
	User findByUsername(String username);
	User findByEmail(String email);
	List<User> findAllByIdIn(List<Long> ids);
}
