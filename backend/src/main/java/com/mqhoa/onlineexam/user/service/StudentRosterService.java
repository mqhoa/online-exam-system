package com.mqhoa.onlineexam.user.service;

import com.mqhoa.onlineexam.common.ForbiddenOperationException;
import com.mqhoa.onlineexam.common.InvalidRequestException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.sql.Date;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.apache.poi.ss.usermodel.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class StudentRosterService {
    private final JdbcTemplate jdbc; private final PasswordEncoder passwords; private final SecureRandom random=new SecureRandom();
    public StudentRosterService(JdbcTemplate jdbc,PasswordEncoder passwords){this.jdbc=jdbc;this.passwords=passwords;}
    private void requireAdmin(Authentication auth){if(auth.getAuthorities().stream().noneMatch(a->a.getAuthority().equals("ROLE_ADMIN")))throw new ForbiddenOperationException("Only administrators can manage the student roster");}

    public List<StudentRow> list(Authentication auth){requireAdmin(auth);return jdbc.query("SELECT u.id,u.username,u.full_name,u.email,u.date_of_birth,u.enabled,COALESCE(string_agg(c.code,',' ORDER BY c.code),'') FROM users u LEFT JOIN student_classes sc ON sc.student_id=u.id LEFT JOIN classes c ON c.id=sc.class_id WHERE u.role='STUDENT' GROUP BY u.id ORDER BY u.id",(rs,n)->new StudentRow(rs.getLong(1),rs.getString(2),rs.getString(3),rs.getString(4),rs.getDate(5)==null?null:rs.getDate(5).toLocalDate().toString(),rs.getBoolean(6),rs.getString(7).isBlank()?List.of():List.of(rs.getString(7).split(","))));}

    public List<ImportRow> preview(MultipartFile file,Authentication auth){requireAdmin(auth);return parse(file);}

    @Transactional public CreatedStudent create(StudentProfile profile,Authentication auth){requireAdmin(auth);validateProfile(profile);Integer exists=jdbc.queryForObject("SELECT count(*) FROM users WHERE lower(username)=lower(?) OR lower(email)=lower(?)",Integer.class,profile.code(),profile.email());if(exists!=null&&exists>0)throw new InvalidRequestException("Mã sinh viên hoặc email đã tồn tại");String temp=generatePassword();Long id=jdbc.queryForObject("INSERT INTO users(username,password_hash,full_name,email,role,enabled,date_of_birth) VALUES (?,?,?,?, 'STUDENT',TRUE,?) RETURNING id",Long.class,profile.code().trim(),passwords.encode(temp),profile.fullName().trim(),profile.email().trim(),Date.valueOf(profile.dateOfBirth()));replaceClasses(id,profile.classes());return new CreatedStudent(id,temp);}

    @Transactional public void update(long id,StudentProfile profile,Authentication auth){requireAdmin(auth);validateProfile(profile);Integer existing=jdbc.queryForObject("SELECT count(*) FROM users WHERE id=? AND role='STUDENT'",Integer.class,id);if(existing==null||existing==0)throw new InvalidRequestException("Không tìm thấy sinh viên");Integer duplicate=jdbc.queryForObject("SELECT count(*) FROM users WHERE id<>? AND (lower(username)=lower(?) OR lower(email)=lower(?))",Integer.class,id,profile.code(),profile.email());if(duplicate!=null&&duplicate>0)throw new InvalidRequestException("Mã sinh viên hoặc email đã được sử dụng");jdbc.update("UPDATE users SET username=?,full_name=?,email=?,date_of_birth=? WHERE id=?",profile.code().trim(),profile.fullName().trim(),profile.email().trim(),Date.valueOf(profile.dateOfBirth()),id);replaceClasses(id,profile.classes());}
    private void validateProfile(StudentProfile p){if(p.code()==null||p.code().isBlank()||p.fullName()==null||p.fullName().isBlank()||p.email()==null||!p.email().matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")||p.dateOfBirth()==null)throw new InvalidRequestException("Thông tin sinh viên không hợp lệ");try{LocalDate.parse(p.dateOfBirth());}catch(Exception e){throw new InvalidRequestException("Ngày sinh phải theo yyyy-MM-dd");}}
    private void replaceClasses(long studentId,List<String> classCodes){jdbc.update("DELETE FROM student_classes WHERE student_id=?",studentId);if(classCodes==null)return;for(String raw:classCodes){String code=raw.trim().toUpperCase(Locale.ROOT);if(code.isBlank())continue;Long classId=jdbc.queryForObject("INSERT INTO classes(code,name) VALUES (?,?) ON CONFLICT(code) DO UPDATE SET name=EXCLUDED.name RETURNING id",Long.class,code,code);jdbc.update("INSERT INTO student_classes(student_id,class_id) VALUES (?,?) ON CONFLICT DO NOTHING",studentId,classId);}}

    @Transactional
    public ImportResult importWorkbook(MultipartFile file,Authentication auth){
        requireAdmin(auth);List<ImportRow> rows=parse(file);if(rows.stream().anyMatch(r->!r.valid()))throw new InvalidRequestException("Tệp có dòng lỗi; hãy sửa các dòng được đánh dấu rồi import lại");
        Set<String> codes=new HashSet<>(),emails=new HashSet<>();
        for(ImportRow row:rows){if(!codes.add(row.code().toLowerCase(Locale.ROOT)))throw new InvalidRequestException("Mã sinh viên bị trùng trong tệp: "+row.code());if(!emails.add(row.email().toLowerCase(Locale.ROOT)))throw new InvalidRequestException("Email bị trùng trong tệp: "+row.email());
            Integer duplicate=jdbc.queryForObject("SELECT count(*) FROM users WHERE lower(username)=lower(?) OR lower(email)=lower(?)",Integer.class,row.code(),row.email());if(duplicate!=null&&duplicate>0)throw new InvalidRequestException("Mã sinh viên hoặc email đã tồn tại: "+row.code());}
        List<GeneratedCredential> credentials=new ArrayList<>();
        for(ImportRow row:rows){String rawPassword=generatePassword();Long studentId=jdbc.queryForObject("INSERT INTO users(username,password_hash,full_name,email,role,enabled,date_of_birth) VALUES (?,?,?,?, 'STUDENT',TRUE,?) RETURNING id",Long.class,row.code(),passwords.encode(rawPassword),row.fullName(),row.email(),Date.valueOf(row.dateOfBirth()));
            for(String classCode:row.classes()){Long classId=jdbc.queryForObject("INSERT INTO classes(code,name) VALUES (?,?) ON CONFLICT(code) DO UPDATE SET name=EXCLUDED.name RETURNING id",Long.class,classCode,classCode);jdbc.update("INSERT INTO student_classes(student_id,class_id) VALUES (?,?) ON CONFLICT DO NOTHING",studentId,classId);}
            credentials.add(new GeneratedCredential(row.code(),rawPassword));}
        return new ImportResult(credentials.size(),credentials);
    }

    private List<ImportRow> parse(MultipartFile file){
        if(file==null||file.isEmpty())throw new InvalidRequestException("Chưa chọn tệp danh sách sinh viên");String filename=Objects.toString(file.getOriginalFilename(),"").toLowerCase(Locale.ROOT);
        if(filename.endsWith(".csv")){try{return parseCsv(new String(file.getBytes(),StandardCharsets.UTF_8));}catch(Exception e){throw new InvalidRequestException("Không đọc được tệp CSV");}}
        try(InputStream in=file.getInputStream();Workbook workbook=WorkbookFactory.create(in)){
            Sheet sheet=workbook.getSheetAt(0);DataFormatter formatter=new DataFormatter(Locale.ROOT);Row header=sheet.getRow(0);if(header==null)throw new InvalidRequestException("Tệp thiếu dòng tiêu đề");
            Map<String,Integer> columns=new HashMap<>();for(Cell c:header){String name=normalize(formatter.formatCellValue(c));columns.put(name,c.getColumnIndex());}
            int codeCol=find(columns,"mã sinh viên","mã sv","mssv","code","username");int nameCol=find(columns,"họ và tên","họ tên","full name","fullname","name");int classCol=find(columns,"lớp","class","classes");int dobCol=find(columns,"ngày sinh","date of birth","dob");int emailCol=find(columns,"email","thư điện tử");
            if(codeCol<0||nameCol<0||emailCol<0||dobCol<0)throw new InvalidRequestException("Tiêu đề bắt buộc: Mã sinh viên, Họ và tên, Ngày sinh, Email. Cột Lớp có thể bỏ trống.");
            List<ImportRow> result=new ArrayList<>();
            for(int i=1;i<=sheet.getLastRowNum();i++){Row row=sheet.getRow(i);if(row==null)continue;String code=cell(row,codeCol,formatter).trim(),name=cell(row,nameCol,formatter).trim(),email=cell(row,emailCol,formatter).trim();String classRaw=classCol<0?"":cell(row,classCol,formatter);String dobRaw=dobCol<0?"":cell(row,dobCol,formatter);
                if(code.isBlank()&&name.isBlank()&&email.isBlank())continue;List<String> errors=new ArrayList<>();if(code.isBlank())errors.add("Thiếu mã sinh viên");if(name.isBlank())errors.add("Thiếu họ tên");if(!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))errors.add("Email không hợp lệ");
                List<String> classes=Arrays.stream(classRaw.split("[/;,|]+" )).map(String::trim).filter(s->!s.isBlank()).map(s->s.toUpperCase(Locale.ROOT)).distinct().toList();String dob=normalizeDate(row,dobCol,dobRaw,formatter);if(dob==null)errors.add("Ngày sinh phải theo yyyy-MM-dd");
                result.add(new ImportRow(i+1,code,name,email,classes,dob,errors.isEmpty(),errors));}
            if(result.isEmpty())throw new InvalidRequestException("Tệp không có dữ liệu sinh viên");return validateUniqueRows(result);
        }catch(InvalidRequestException ex){throw ex;}catch(Exception ex){throw new InvalidRequestException("Không đọc được tệp "+filename+". Hãy dùng .xlsx hoặc .xls theo mẫu.");}
    }
    private List<ImportRow> parseCsv(String source){
        List<List<String>> records=new ArrayList<>();List<String> cells=new ArrayList<>();StringBuilder cell=new StringBuilder();boolean quoted=false;String text=source.startsWith("\uFEFF")?source.substring(1):source;String firstLine=text.lines().findFirst().orElse("");char delimiter=firstLine.contains("\t")?'\t':(!firstLine.contains(",")&&firstLine.contains(";"))?';':',';
        for(int i=0;i<text.length();i++){char ch=text.charAt(i);if(ch=='"'){if(quoted&&i+1<text.length()&&text.charAt(i+1)=='"'){cell.append('"');i++;}else quoted=!quoted;}else if(!quoted&&ch==delimiter){cells.add(cell.toString());cell.setLength(0);}else if(!quoted&&(ch=='\n'||ch=='\r')){if(ch=='\r'&&i+1<text.length()&&text.charAt(i+1)=='\n')i++;cells.add(cell.toString());records.add(cells);cells=new ArrayList<>();cell.setLength(0);}else cell.append(ch);}
        if(quoted)throw new InvalidRequestException("CSV có dấu ngoặc kép chưa được đóng");if(cell.length()>0||!cells.isEmpty()){cells.add(cell.toString());records.add(cells);}if(records.size()<2)throw new InvalidRequestException("CSV không có dữ liệu");
        Map<String,Integer> columns=new HashMap<>();for(int i=0;i<records.get(0).size();i++)columns.put(normalize(records.get(0).get(i)),i);int codeCol=find(columns,"mã sinh viên","mã sv","mssv","code","username"),nameCol=find(columns,"họ và tên","họ tên","full name","fullname","name"),classCol=find(columns,"lớp","class","classes"),dobCol=find(columns,"ngày sinh","date of birth","dob"),emailCol=find(columns,"email","thư điện tử");if(codeCol<0||nameCol<0||emailCol<0)throw new InvalidRequestException("Tiêu đề cần có: Mã sinh viên, Họ và tên, Email");
        List<ImportRow> rows=new ArrayList<>();for(int i=1;i<records.size();i++){List<String> r=records.get(i);String code=csv(r,codeCol),name=csv(r,nameCol),email=csv(r,emailCol),date=csv(r,dobCol);if(code.isBlank()&&name.isBlank()&&email.isBlank())continue;List<String> errors=new ArrayList<>();if(code.isBlank())errors.add("Thiếu mã sinh viên");if(name.isBlank())errors.add("Thiếu họ tên");if(!email.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"))errors.add("Email không hợp lệ");String dob=null;try{dob=LocalDate.parse(date).toString();}catch(Exception ignored){}if(dob==null)errors.add("Ngày sinh phải theo yyyy-MM-dd");List<String> classes=Arrays.stream(csv(r,classCol).split("[/;,|]+" )).map(String::trim).filter(s->!s.isBlank()).map(s->s.toUpperCase(Locale.ROOT)).distinct().toList();rows.add(new ImportRow(i+1,code,name,email,classes,dob,errors.isEmpty(),errors));}
        if(rows.isEmpty())throw new InvalidRequestException("CSV không có dòng dữ liệu");return validateUniqueRows(rows);
    }
    private List<ImportRow> validateUniqueRows(List<ImportRow> rows){Set<String> seenCodes=new HashSet<>(),seenEmails=new HashSet<>();List<ImportRow> checked=new ArrayList<>();for(ImportRow row:rows){List<String> errors=new ArrayList<>(row.errors());String code=row.code().toLowerCase(Locale.ROOT),email=row.email().toLowerCase(Locale.ROOT);if(!code.isBlank()&&!seenCodes.add(code))errors.add("Mã sinh viên bị lặp trong tệp");if(!email.isBlank()&&!seenEmails.add(email))errors.add("Email bị lặp trong tệp");if(!code.isBlank()&&!email.isBlank()){Integer duplicate=jdbc.queryForObject("SELECT count(*) FROM users WHERE lower(username)=lower(?) OR lower(email)=lower(?)",Integer.class,row.code(),row.email());if(duplicate!=null&&duplicate>0)errors.add("Mã sinh viên hoặc email đã tồn tại");}checked.add(new ImportRow(row.rowNumber(),row.code(),row.fullName(),row.email(),row.classes(),row.dateOfBirth(),errors.isEmpty(),errors));}return checked;}
    private String csv(List<String> row,int col){return col<0||col>=row.size()?"":row.get(col).trim();}
    private String normalizeDate(Row row,int col,String raw,DataFormatter formatter){if(raw.isBlank())return null;try{Cell c=row.getCell(col);if(c!=null&&DateUtil.isCellDateFormatted(c))return c.getLocalDateTimeCellValue().toLocalDate().toString();return LocalDate.parse(raw.trim(),DateTimeFormatter.ISO_LOCAL_DATE).toString();}catch(Exception e){return null;}}
    private int find(Map<String,Integer> headers,String... aliases){for(String alias:aliases){Integer col=headers.get(normalize(alias));if(col!=null)return col;}return -1;}
    private String normalize(String s){return s==null?"":s.replace("\uFEFF","").trim().toLowerCase(Locale.ROOT).replaceAll("\\s+"," ");}
    private String cell(Row row,int col,DataFormatter formatter){Cell c=row.getCell(col,Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);return c==null?"":formatter.formatCellValue(c);}
    private String generatePassword(){String alphabet="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$";StringBuilder out=new StringBuilder(14);for(int i=0;i<14;i++)out.append(alphabet.charAt(random.nextInt(alphabet.length())));return out.toString();}
    public byte[] template(){try(Workbook wb=new org.apache.poi.xssf.usermodel.XSSFWorkbook();java.io.ByteArrayOutputStream out=new java.io.ByteArrayOutputStream()){Sheet s=wb.createSheet("Students");Row h=s.createRow(0);String[] labels={"Mã sinh viên","Họ và tên","Lớp","Ngày sinh","Email"};for(int i=0;i<labels.length;i++){h.createCell(i).setCellValue(labels[i]);s.setColumnWidth(i,24*256);}Row sample=s.createRow(1);sample.createCell(0).setCellValue("SV0001");sample.createCell(1).setCellValue("Nguyễn Văn A");sample.createCell(2).setCellValue("CNTT01; CNTT02");sample.createCell(3).setCellValue("2004-01-15");sample.createCell(4).setCellValue("sv0001@example.edu.vn");s.createFreezePane(0,1);wb.write(out);return out.toByteArray();}catch(Exception e){throw new IllegalStateException(e);}}

    public record StudentRow(long id,String code,String fullName,String email,String dateOfBirth,boolean enabled,List<String> classes){}
    public record StudentProfile(String code,String fullName,List<String> classes,String dateOfBirth,String email){}
    public record CreatedStudent(long id,String initialPassword){}
    public record ImportRow(int rowNumber,String code,String fullName,String email,List<String> classes,String dateOfBirth,boolean valid,List<String> errors){}
    public record GeneratedCredential(String username,String initialPassword){}
    public record ImportResult(int importedCount,List<GeneratedCredential> credentials){}
}
