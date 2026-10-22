package com.mqhoa.onlineexam.question.service;

import com.mqhoa.onlineexam.common.InvalidRequestException;
import com.mqhoa.onlineexam.common.ForbiddenOperationException;
import com.mqhoa.onlineexam.common.ResourceNotFoundException;
import com.mqhoa.onlineexam.question.Question;
import com.mqhoa.onlineexam.question.QuestionOption;
import com.mqhoa.onlineexam.question.QuestionType;
import com.mqhoa.onlineexam.question.dto.CreateQuestionRequest;
import com.mqhoa.onlineexam.question.dto.QuestionOptionRequest;
import com.mqhoa.onlineexam.question.dto.QuestionResponse;
import com.mqhoa.onlineexam.question.dto.UpdateQuestionRequest;
import com.mqhoa.onlineexam.question.repository.QuestionOptionRepository;
import com.mqhoa.onlineexam.question.repository.QuestionReferenceRepository;
import com.mqhoa.onlineexam.question.repository.QuestionRepository;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class QuestionService {
    private final QuestionRepository questions;
    private final QuestionOptionRepository options;
    private final QuestionReferenceRepository references;
    private final QuestionMapper mapper;

    public QuestionService(QuestionRepository questions, QuestionOptionRepository options,
                           QuestionReferenceRepository references, QuestionMapper mapper) {
        this.questions = questions;
        this.options = options;
        this.references = references;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> listByTeacherGroup(Long teacherGroupId) {
        if (!references.teacherGroupExists(teacherGroupId)) {
            throw new ResourceNotFoundException("Teacher group", teacherGroupId);
        }
        List<Question> found = questions.findByTeacherGroupIdOrderByCreatedAtDesc(teacherGroupId);
        if (found.isEmpty()) return List.of();

        List<Long> ids = found.stream().map(Question::getId).toList();
        Map<Long, List<QuestionOption>> optionsByQuestion = options
                .findByQuestionIdInOrderByQuestionIdAscPositionAsc(ids).stream()
                .collect(Collectors.groupingBy(QuestionOption::getQuestionId));

        return found.stream()
                .map(question -> mapper.toResponse(question,
                        optionsByQuestion.getOrDefault(question.getId(), List.of())))
                .toList();
    }

    @Transactional(readOnly = true)
    public QuestionResponse get(Long questionId) {
        Question question = getQuestion(questionId);
        return mapper.toResponse(question, options.findByQuestionIdOrderByPositionAsc(questionId));
    }

    @Transactional
    public QuestionResponse create(CreateQuestionRequest request) {
        validateOptions(request.questionType(), request.options());
        if (!references.teacherGroupExists(request.teacherGroupId())) {
            throw new ResourceNotFoundException("Teacher group", request.teacherGroupId());
        }
        if (!references.teacherBelongsToGroup(request.createdBy(), request.teacherGroupId())) {
            throw new ForbiddenOperationException("Creator must be an active teacher assigned to the selected group");
        }
        Question question = questions.save(Question.create(request.teacherGroupId(), request.createdBy(),
                request.content().trim(), request.questionType()));
        List<QuestionOption> savedOptions = options.saveAll(toEntities(question.getId(), request.options()));
        return mapper.toResponse(question, savedOptions);
    }

    @Transactional
    public QuestionResponse update(Long questionId, UpdateQuestionRequest request) {
        validateOptions(request.questionType(), request.options());
        Question question = getQuestion(questionId);
        question.update(request.content().trim(), request.questionType());
        questions.save(question);

        List<QuestionOption> previousOptions = options.findByQuestionIdOrderByPositionAsc(questionId);
        options.deleteAll(previousOptions);
        options.flush();
        List<QuestionOption> savedOptions = options.saveAll(toEntities(questionId, request.options()));
        return mapper.toResponse(question, savedOptions);
    }

    @Transactional
    public void delete(Long questionId) {
        Question question = getQuestion(questionId);
        questions.delete(question);
    }

    private Question getQuestion(Long questionId) {
        return questions.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question", questionId));
    }

    private List<QuestionOption> toEntities(Long questionId, List<QuestionOptionRequest> requests) {
        return java.util.stream.IntStream.range(0, requests.size())
                .mapToObj(index -> {
                    QuestionOptionRequest request = requests.get(index);
                    return QuestionOption.create(questionId, request.content().trim(), request.correct(), index + 1);
                })
                .toList();
    }

    private void validateOptions(QuestionType type, List<QuestionOptionRequest> questionOptions) {
        if (questionOptions == null || questionOptions.isEmpty()) {
            throw new InvalidRequestException("At least one answer option is required");
        }
        Set<String> normalizedContents = new HashSet<>();
        for (QuestionOptionRequest option : questionOptions) {
            if (option == null) throw new InvalidRequestException("Answer options cannot contain null values");
            String normalized = option.content().trim().toLowerCase(Locale.ROOT);
            if (!normalizedContents.add(normalized)) {
                throw new InvalidRequestException("Answer options must have unique content");
            }
        }

        long correctCount = questionOptions.stream().filter(QuestionOptionRequest::correct).count();
        switch (type) {
            case SINGLE_CHOICE -> {
                if (questionOptions.size() < 2 || correctCount != 1) {
                    throw new InvalidRequestException("SINGLE_CHOICE requires at least two options and exactly one correct answer");
                }
            }
            case MULTIPLE_CHOICE -> {
                if (questionOptions.size() < 3 || correctCount < 2 || correctCount == questionOptions.size()) {
                    throw new InvalidRequestException("MULTIPLE_CHOICE requires at least two correct options and one incorrect option");
                }
            }
            case SHORT_ANSWER -> {
                if (correctCount != questionOptions.size()) {
                    throw new InvalidRequestException("All SHORT_ANSWER options must be accepted answers");
                }
            }
        }
    }
}
