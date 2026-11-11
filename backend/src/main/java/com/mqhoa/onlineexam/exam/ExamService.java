package com.mqhoa.onlineexam.exam;

import static com.mqhoa.onlineexam.exam.dto.ExamDtos.*;
import com.mqhoa.onlineexam.common.ForbiddenOperationException;
import com.mqhoa.onlineexam.common.InvalidRequestException;
import com.mqhoa.onlineexam.common.ResourceNotFoundException;
import com.mqhoa.onlineexam.question.QuestionType;
import com.mqhoa.onlineexam.exam.repository.ExamRepository;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExamService {
    private final JdbcTemplate jdbc;
    private final ExamRepository repository;
    public ExamService(JdbcTemplate jdbc, ExamRepository repository) { this.jdbc = jdbc; this.repository = repository; }

    private record Actor(long id, String role) {}
    private static final String SHORT_ANSWER_MATCH = "EXISTS (SELECT 1 FROM options o WHERE o.question_id=q.id AND o.is_correct=TRUE AND (" +
            "regexp_replace(lower(btrim(COALESCE(ea.answer_text,''))), '[[:space:]]+', ' ', 'g') = regexp_replace(lower(btrim(o.content)), '[[:space:]]+', ' ', 'g') " +
            "OR (CASE WHEN regexp_replace(lower(btrim(COALESCE(ea.answer_text,''))), '[[:space:]]+', ' ', 'g') ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$' " +
            "AND regexp_replace(lower(btrim(o.content)), '[[:space:]]+', ' ', 'g') ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$' " +
            "THEN regexp_replace(lower(btrim(COALESCE(ea.answer_text,''))), '[[:space:]]+', ' ', 'g')::numeric = regexp_replace(lower(btrim(o.content)), '[[:space:]]+', ' ', 'g')::numeric ELSE FALSE END)))";
    private Actor actor(Authentication auth) {
        var actor = repository.findEnabledActor(auth.getName());
        return new Actor(actor.id(), actor.role());
    }
    private void requireRole(Actor a, String... roles) {
        if (Arrays.stream(roles).noneMatch(a.role()::equals)) throw new ForbiddenOperationException("Your role cannot perform this operation");
    }
    private boolean member(long teacherId, long groupId) {
        return repository.isTeacherGroupMember(teacherId, groupId);
    }

    @Transactional
    public ExamView create(ExamRequest r, Authentication auth) {
        Actor a=actor(auth); requireRole(a,"TEACHER","ADMIN");
        if (r.endTime().isBefore(r.startTime()) || !r.endTime().isAfter(r.startTime())) throw new InvalidRequestException("Exam end time must be after start time");
        if ("TEACHER".equals(a.role()) && !member(a.id(),r.teacherGroupId())) throw new ForbiddenOperationException("Teacher is not assigned to this group");
        validateQuestions(r.teacherGroupId(),r.questions());
        long id=jdbc.queryForObject("INSERT INTO exams(group_id,title,description,created_by,start_time,end_time,duration_minutes,pin,status) VALUES (?,?,?,?,?,?,?,?,'DRAFT') RETURNING id",Long.class,r.teacherGroupId(),r.title().trim(),r.description(),a.id(),Timestamp.from(r.startTime()),Timestamp.from(r.endTime()),r.durationMinutes(),r.pin());
        int order=1; for(QuestionPick q:r.questions()) jdbc.update("INSERT INTO exam_questions(exam_id,question_id,question_order,score) VALUES (?,?,?,?)",id,q.questionId(),order++,q.score());
        return getExam(id,a,false,true);
    }
    @Transactional
    public ExamView update(long id, ExamRequest r, Authentication auth) {
        Actor a=actor(auth); requireRole(a,"TEACHER","ADMIN"); ExamRow old=examRow(id);
        requireExamEditor(a,old);
        if(!"DRAFT".equals(old.status())) throw new InvalidRequestException("Only draft exams can be edited");
        if ("TEACHER".equals(a.role()) && !member(a.id(),r.teacherGroupId())) throw new ForbiddenOperationException("Teacher is not assigned to the selected group");
        if (!r.endTime().isAfter(r.startTime())) throw new InvalidRequestException("Exam end time must be after start time");
        validateQuestions(r.teacherGroupId(),r.questions());
        jdbc.update("UPDATE exams SET group_id=?,title=?,description=?,start_time=?,end_time=?,duration_minutes=?,pin=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",r.teacherGroupId(),r.title().trim(),r.description(),Timestamp.from(r.startTime()),Timestamp.from(r.endTime()),r.durationMinutes(),r.pin(),id);
        jdbc.update("DELETE FROM exam_questions WHERE exam_id=?",id); int order=1;
        for(QuestionPick q:r.questions()) jdbc.update("INSERT INTO exam_questions(exam_id,question_id,question_order,score) VALUES (?,?,?,?)",id,q.questionId(),order++,q.score());
        return getExam(id,a,false,true);
    }
    private void validateQuestions(long groupId,List<QuestionPick> picks) {
        Set<Long> ids=new HashSet<>();
        for(QuestionPick q:picks) {
            if(!ids.add(q.questionId())) throw new InvalidRequestException("Exam cannot contain duplicate questions");
            Integer count=jdbc.queryForObject("SELECT count(*) FROM questions WHERE id=? AND teacher_group_id=?",Integer.class,q.questionId(),groupId);
            if(count==null||count==0) throw new InvalidRequestException("Every exam question must belong to the selected teacher group");
        }
    }
    @Transactional
    public ExamView changeStatus(long id,String status,Authentication auth) {
        Actor a=actor(auth); requireRole(a,"TEACHER","ADMIN"); ExamRow row=examRow(id); requireExamEditor(a,row);
        if("PUBLISHED".equals(status) && !"DRAFT".equals(row.status())) throw new InvalidRequestException("Only draft exams can be published");
        if("CLOSED".equals(status) && !"PUBLISHED".equals(row.status())) throw new InvalidRequestException("Only published exams can be closed");
        jdbc.update("UPDATE exams SET status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?",status,id);
        return getExam(id,a,false,true);
    }
    public List<ExamView> list(Long groupId,Authentication auth) {
        Actor a=actor(auth);
        if("STUDENT".equals(a.role())) {
            return jdbc.query("SELECT id FROM exams WHERE status='PUBLISHED' AND end_time>CURRENT_TIMESTAMP ORDER BY start_time",(rs,n)->getExam(rs.getLong(1),a,true,false));
        }
        requireRole(a,"TEACHER","ADMIN");
        String sql="SELECT e.id FROM exams e WHERE (CAST(? AS BIGINT) IS NULL OR e.group_id=CAST(? AS BIGINT)) AND (?='ADMIN' OR EXISTS(SELECT 1 FROM teacher_group_members m WHERE m.group_id=e.group_id AND m.teacher_id=?)) ORDER BY e.start_time DESC";
        return jdbc.query(sql,(rs,n)->getExam(rs.getLong(1),a,false,true),groupId,groupId,a.role(),a.id());
    }
    public ExamView get(long id,Authentication auth) { Actor a=actor(auth); boolean student="STUDENT".equals(a.role()); return getExam(id,a,student,!student); }

    @Transactional
    public AttemptView start(long examId,String pin,Authentication auth) {
        Actor a=actor(auth); requireRole(a,"STUDENT"); ExamRow exam=examRow(examId);
        if(!"PUBLISHED".equals(exam.status()) || Instant.now().isBefore(exam.start()) || !Instant.now().isBefore(exam.end())) throw new InvalidRequestException("This exam is not open");
        if(repository.isPinLocked(examId,a.id())) throw new InvalidRequestException("Too many incorrect PIN attempts; try again in 10 minutes");
        String expected=jdbc.queryForObject("SELECT pin FROM exams WHERE id=?",String.class,examId);
        if(!Objects.equals(pin,expected)) { repository.recordFailedPin(examId,a.id()); throw new InvalidRequestException("Incorrect exam PIN"); }
        repository.clearPinFailures(examId,a.id());
        List<Long> existing=jdbc.query("SELECT id FROM exam_attempts WHERE exam_id=? AND student_id=?",(rs,n)->rs.getLong(1),examId,a.id());
        long attemptId;
        if(!existing.isEmpty()) {
            attemptId=existing.get(0);
            String existingStatus=jdbc.queryForObject("SELECT status FROM exam_attempts WHERE id=?",String.class,attemptId);
            if (!"IN_PROGRESS".equals(existingStatus)) throw new InvalidRequestException("You have already submitted this exam");
        }
        else {
            Instant deadline=Instant.now().plusSeconds(exam.durationMinutes()*60L); if(deadline.isAfter(exam.end())) deadline=exam.end();
            jdbc.update("INSERT INTO exam_attempts(exam_id,student_id,deadline,status) VALUES (?,?,?,'IN_PROGRESS') ON CONFLICT(exam_id,student_id) DO NOTHING",examId,a.id(),Timestamp.from(deadline));
            attemptId=jdbc.queryForObject("SELECT id FROM exam_attempts WHERE exam_id=? AND student_id=?",Long.class,examId,a.id());
        }
        return attempt(attemptId,a);
    }
    public AttemptView getAttempt(long attemptId,Authentication auth) { Actor a=actor(auth); return attempt(attemptId,a); }

    @Transactional
    public void saveAnswer(long attemptId,long questionId,AnswerRequest request,Authentication auth) {
        Actor a=actor(auth); requireRole(a,"STUDENT"); AttemptRow at=lockAttempt(attemptId,a); assertInProgress(at);
        Integer included=jdbc.queryForObject("SELECT count(*) FROM exam_questions WHERE exam_id=? AND question_id=?",Integer.class,at.examId(),questionId);
        if(included==null||included==0) throw new InvalidRequestException("Question is not part of this exam");
        QuestionType type=QuestionType.valueOf(jdbc.queryForObject("SELECT question_type FROM questions WHERE id=?",String.class,questionId));
        List<Long> optionIds=request.optionIds()==null?List.of():request.optionIds();
        if(type==QuestionType.SHORT_ANSWER && !optionIds.isEmpty()) throw new InvalidRequestException("Short answers cannot select options");
        if(type!=QuestionType.SHORT_ANSWER && request.answerText()!=null && !request.answerText().isBlank()) throw new InvalidRequestException("Choice questions cannot submit answer text");
        if(type==QuestionType.SINGLE_CHOICE && optionIds.size()>1) throw new InvalidRequestException("Single choice accepts one answer");
        if(new HashSet<>(optionIds).size()!=optionIds.size()) throw new InvalidRequestException("Duplicate selected options");
        if(!optionIds.isEmpty()) {
            String placeholders=String.join(",", Collections.nCopies(optionIds.size(),"?"));
            List<Object> args=new ArrayList<>(); args.add(questionId); args.addAll(optionIds);
            Integer valid=jdbc.queryForObject("SELECT count(*) FROM options WHERE question_id=? AND id IN ("+placeholders+")",Integer.class,args.toArray());
            if(valid==null||valid!=optionIds.size()) throw new InvalidRequestException("Selected option does not belong to this question");
        }
        Long answerId=jdbc.queryForObject("INSERT INTO exam_answers(attempt_id,question_id,answer_text) VALUES (?,?,?) ON CONFLICT(attempt_id,question_id) DO UPDATE SET answer_text=EXCLUDED.answer_text, answered_at=CURRENT_TIMESTAMP RETURNING id",Long.class,attemptId,questionId,request.answerText());
        jdbc.update("DELETE FROM exam_answer_options WHERE answer_id=?",answerId);
        for(Long option:optionIds) jdbc.update("INSERT INTO exam_answer_options(answer_id,option_id) VALUES (?,?)",answerId,option);
    }

    @Transactional
    public ResultView submit(long attemptId,Authentication auth) {
        Actor a=actor(auth); requireRole(a,"STUDENT"); AttemptRow at=lockAttempt(attemptId,a);
        if(!"IN_PROGRESS".equals(at.status())) return result(attemptId,a,false);
        boolean timedOut=!Instant.now().isBefore(at.deadline());
        String scoreSql="SELECT COALESCE(SUM(eq.score),0), COALESCE(SUM(CASE WHEN q.question_type='SHORT_ANSWER' THEN CASE WHEN "+SHORT_ANSWER_MATCH+" THEN eq.score ELSE 0 END WHEN NOT EXISTS(SELECT option_id FROM exam_answer_options WHERE answer_id=ea.id EXCEPT SELECT id FROM options WHERE question_id=q.id AND is_correct=TRUE) AND NOT EXISTS(SELECT id FROM options WHERE question_id=q.id AND is_correct=TRUE EXCEPT SELECT option_id FROM exam_answer_options WHERE answer_id=ea.id) THEN eq.score ELSE 0 END),0) FROM exam_questions eq JOIN questions q ON q.id=eq.question_id LEFT JOIN exam_answers ea ON ea.question_id=q.id AND ea.attempt_id=? WHERE eq.exam_id=?";
        BigDecimal[] totals=jdbc.query(scoreSql,rs->{rs.next();return new BigDecimal[]{rs.getBigDecimal(1),rs.getBigDecimal(2)};},attemptId,at.examId());
        jdbc.update("UPDATE exam_attempts SET status=?,submitted_at=CURRENT_TIMESTAMP,total_score=? WHERE id=? AND status='IN_PROGRESS'",timedOut?"AUTO_SUBMITTED":"SUBMITTED",totals[1],attemptId);
        return result(attemptId,a,false);
    }

    public ResultView result(long attemptId,Authentication auth) { Actor a=actor(auth); requireRole(a,"STUDENT","TEACHER","ADMIN"); return result(attemptId,a,true); }
    public List<ResultView> results(long examId,Authentication auth) {
        Actor a=actor(auth); requireRole(a,"TEACHER","ADMIN"); requireExamEditor(a,examRow(examId));
        return jdbc.query("SELECT id FROM exam_attempts WHERE exam_id=? ORDER BY submitted_at",(rs,n)->result(rs.getLong(1),a,false),examId);
    }
    public List<ResultView> myResults(Authentication auth) {
        Actor a=actor(auth); requireRole(a,"STUDENT");
        return jdbc.query("SELECT id FROM exam_attempts WHERE student_id=? AND status IN ('SUBMITTED','AUTO_SUBMITTED') ORDER BY submitted_at DESC",(rs,n)->result(rs.getLong(1),a,true),a.id());
    }
    private ResultView result(long id,Actor a,boolean enforceOwnership) {
        return jdbc.query("SELECT at.id,at.exam_id,e.title,u.id,u.username,u.full_name,at.status,at.submitted_at,at.total_score,COALESCE((SELECT SUM(score) FROM exam_questions WHERE exam_id=e.id),0),at.student_id,e.group_id FROM exam_attempts at JOIN exams e ON e.id=at.exam_id JOIN users u ON u.id=at.student_id WHERE at.id=?",rs->{if(!rs.next()) throw new ResourceNotFoundException("Attempt",id); if("STUDENT".equals(a.role())&&rs.getLong(11)!=a.id())throw new ForbiddenOperationException("You cannot view another student's result"); if("TEACHER".equals(a.role())&&!member(a.id(),rs.getLong(12)))throw new ForbiddenOperationException("You cannot view these results"); return new ResultView(rs.getLong(1),rs.getLong(2),rs.getString(3),rs.getLong(4),rs.getString(5),rs.getString(6),rs.getString(7),rs.getTimestamp(8)==null?null:rs.getTimestamp(8).toInstant(),rs.getBigDecimal(9),rs.getBigDecimal(10));},id);
    }
    private record AttemptRow(long id,long examId,long studentId,Instant deadline,String status) {}
    private AttemptRow lockAttempt(long id,Actor a) {
        return jdbc.query("SELECT id,exam_id,student_id,deadline,status FROM exam_attempts WHERE id=? FOR UPDATE",rs->{if(!rs.next())throw new ResourceNotFoundException("Attempt",id);if("STUDENT".equals(a.role())&&rs.getLong("student_id")!=a.id())throw new ForbiddenOperationException("Attempt belongs to another student");return new AttemptRow(rs.getLong("id"),rs.getLong("exam_id"),rs.getLong("student_id"),rs.getTimestamp("deadline").toInstant(),rs.getString("status"));},id);
    }
    private void assertInProgress(AttemptRow at) { if(!"IN_PROGRESS".equals(at.status()))throw new InvalidRequestException("Attempt is already submitted"); if(!Instant.now().isBefore(at.deadline()))throw new InvalidRequestException("Attempt deadline has passed"); }
    private AttemptView attempt(long id,Actor a) {
        AttemptRow at=jdbc.query("SELECT id,exam_id,student_id,deadline,status FROM exam_attempts WHERE id=?",rs->{if(!rs.next())throw new ResourceNotFoundException("Attempt",id);if("STUDENT".equals(a.role())&&rs.getLong("student_id")!=a.id())throw new ForbiddenOperationException("Attempt belongs to another student");return new AttemptRow(rs.getLong("id"),rs.getLong("exam_id"),rs.getLong("student_id"),rs.getTimestamp("deadline").toInstant(),rs.getString("status"));},id);
        List<SavedAnswer> answers=jdbc.query("SELECT id,question_id,answer_text FROM exam_answers WHERE attempt_id=?",rs->{List<SavedAnswer> out=new ArrayList<>();while(rs.next()){long answerId=rs.getLong(1);List<Long> opts=jdbc.query("SELECT option_id FROM exam_answer_options WHERE answer_id=? ORDER BY option_id",(o,n)->o.getLong(1),answerId);out.add(new SavedAnswer(rs.getLong(2),opts,rs.getString(3)));}return out;},id);
        if("TEACHER".equals(a.role())) requireExamEditor(a,examRow(at.examId()));
        return new AttemptView(at.id(),at.examId(),at.deadline(),at.status(),getExam(at.examId(),a,"STUDENT".equals(a.role()),true),answers);
    }
    private record ExamRow(long id,long groupId,long creator,String status,int durationMinutes,Instant start,Instant end) {}
    private ExamRow examRow(long id) { return jdbc.query("SELECT id,group_id,created_by,status,duration_minutes,start_time,end_time FROM exams WHERE id=?",rs->{if(!rs.next())throw new ResourceNotFoundException("Exam",id);return new ExamRow(rs.getLong(1),rs.getLong(2),rs.getLong(3),rs.getString(4),rs.getInt(5),rs.getTimestamp(6).toInstant(),rs.getTimestamp(7).toInstant());},id); }
    private void requireExamEditor(Actor a,ExamRow e) { if("ADMIN".equals(a.role()))return; if(!"TEACHER".equals(a.role())||!member(a.id(),e.groupId()))throw new ForbiddenOperationException("You do not manage this exam"); }
    private ExamView getExam(long id,Actor a,boolean studentView,boolean includeQuestions) {
        ExamRow e=examRow(id); if(studentView){if("DRAFT".equals(e.status()))throw new ResourceNotFoundException("Exam",id);} else if("TEACHER".equals(a.role()))requireExamEditor(a,e);
        String title=jdbc.queryForObject("SELECT title FROM exams WHERE id=?",String.class,id); String desc=jdbc.queryForObject("SELECT description FROM exams WHERE id=?",String.class,id);
        String pin=studentView?null:jdbc.queryForObject("SELECT pin FROM exams WHERE id=?",String.class,id);
        Integer questionCount=jdbc.queryForObject("SELECT count(*) FROM exam_questions WHERE exam_id=?",Integer.class,id);
        BigDecimal totalPoints=jdbc.queryForObject("SELECT COALESCE(sum(score),0) FROM exam_questions WHERE exam_id=?",BigDecimal.class,id);
        List<ExamQuestionView> qs=includeQuestions ? jdbc.query("SELECT q.id,eq.question_order,q.content,q.question_type,eq.score FROM exam_questions eq JOIN questions q ON q.id=eq.question_id WHERE eq.exam_id=? ORDER BY eq.question_order",(rs,n)->{
            long qid=rs.getLong(1); List<OptionView> opts=jdbc.query("SELECT id,content,option_order FROM options WHERE question_id=? ORDER BY option_order",(o,on)->new OptionView(o.getLong(1),o.getString(2),o.getInt(3)),qid);
            return new ExamQuestionView(qid,rs.getInt(2),rs.getString(3),QuestionType.valueOf(rs.getString(4)),rs.getBigDecimal(5),opts);
        },id) : List.of();
        return new ExamView(id,e.groupId(),title,desc,e.start(),e.end(),e.durationMinutes(),e.status(),pin,questionCount,totalPoints,qs);
    }
    @Scheduled(fixedDelay=5000)
    @Transactional
    public void finalizeExpiredAttempts() {
        List<Long> expired=jdbc.query("SELECT id FROM exam_attempts WHERE status='IN_PROGRESS' AND deadline<=CURRENT_TIMESTAMP ORDER BY id LIMIT 100",(rs,n)->rs.getLong(1));
        for(Long id:expired) {
            List<Long> student=jdbc.query("SELECT student_id FROM exam_attempts WHERE id=?",(rs,n)->rs.getLong(1),id);
            if(!student.isEmpty()) {
                try { submitAsSystem(id); } catch(Exception ignored) { /* retry on the next scheduler pass */ }
            }
        }
    }
    private void submitAsSystem(long id) {
        AttemptRow at=jdbc.query("SELECT id,exam_id,student_id,deadline,status FROM exam_attempts WHERE id=? FOR UPDATE",rs->{if(!rs.next())return null;return new AttemptRow(rs.getLong(1),rs.getLong(2),rs.getLong(3),rs.getTimestamp(4).toInstant(),rs.getString(5));},id);
        if(at==null||!"IN_PROGRESS".equals(at.status()))return;
        String scoreSql="SELECT COALESCE(SUM(CASE WHEN q.question_type='SHORT_ANSWER' THEN CASE WHEN "+SHORT_ANSWER_MATCH+" THEN eq.score ELSE 0 END WHEN NOT EXISTS(SELECT option_id FROM exam_answer_options WHERE answer_id=ea.id EXCEPT SELECT id FROM options WHERE question_id=q.id AND is_correct=TRUE) AND NOT EXISTS(SELECT id FROM options WHERE question_id=q.id AND is_correct=TRUE EXCEPT SELECT option_id FROM exam_answer_options WHERE answer_id=ea.id) THEN eq.score ELSE 0 END),0) FROM exam_questions eq JOIN questions q ON q.id=eq.question_id LEFT JOIN exam_answers ea ON ea.question_id=q.id AND ea.attempt_id=? WHERE eq.exam_id=?";
        BigDecimal score=jdbc.queryForObject(scoreSql,BigDecimal.class,id,at.examId());
        jdbc.update("UPDATE exam_attempts SET status='AUTO_SUBMITTED',submitted_at=CURRENT_TIMESTAMP,total_score=? WHERE id=? AND status='IN_PROGRESS'",score,id);
    }
}
