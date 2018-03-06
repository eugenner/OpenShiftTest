package com.example.service.message;

import org.springframework.data.domain.Sort;
import org.springframework.data.repository.CrudRepository;

public interface PointRepository extends CrudRepository<Point, Integer> {
    Iterable<Point> findAll(Sort sort);
}
