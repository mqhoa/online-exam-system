
package com.mqhoa.onlineexam.subject;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "subjects")
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected Subject() {
    }

    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getName() {
        return name;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void update(String code, String name, String description) {
        this.code = code;
        this.name = name;
        this.description = description;
    }

    public static Subject create(String code, String name, String description) {
        Subject subject = new Subject();
        subject.code = code;
        subject.name = name;
        subject.description = description;
        subject.createdAt = LocalDateTime.now();
        return subject;
    }
}
