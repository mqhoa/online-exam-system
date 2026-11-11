package com.mqhoa.onlineexam.teacher_group.dto;

public record GroupView(long id, String name, String subjectCode, String subjectName,
                        int memberCount, int questionCount, int examCount,boolean enabled) {}
