package com.mqhoa.onlineexam.question.service;

import com.mqhoa.onlineexam.common.InvalidRequestException;
import com.mqhoa.onlineexam.question.QuestionType;
import com.mqhoa.onlineexam.question.dto.CreateQuestionRequest;
import com.mqhoa.onlineexam.question.dto.QuestionOptionRequest;
import com.mqhoa.onlineexam.question.dto.QuestionResponse;
import com.mqhoa.onlineexam.question.repository.QuestionReferenceRepository;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class QuestionExcelService {
    private static final int OPTION_COUNT = 10;
    private final QuestionService questions;
    private final QuestionReferenceRepository references;

    public QuestionExcelService(QuestionService questions,QuestionReferenceRepository references){this.questions=questions;this.references=references;}

    @Transactional
    public int importWorkbook(long groupId, String username, MultipartFile file) {
        requireExcel(file);
        List<ImportRow> rows = readRows(file);
        long userId=references.userId(username);
        for(ImportRow row:rows){
            try { questions.create(new CreateQuestionRequest(groupId,userId,row.content(),row.type(),row.options()),username); }
            catch(RuntimeException ex){throw new InvalidRequestException("Dòng "+row.rowNumber()+": "+ex.getMessage());}
        }
        return rows.size();
    }

    @Transactional(readOnly=true)
    public byte[] exportWorkbook(long groupId,String username){
        List<QuestionResponse> list=questions.listByTeacherGroup(groupId,username);
        try(Workbook workbook=new XSSFWorkbook();ByteArrayOutputStream out=new ByteArrayOutputStream()){
            Sheet sheet=workbook.createSheet("Questions");writeHeader(sheet);
            for(int i=0;i<list.size();i++){
                QuestionResponse q=list.get(i); Row row=sheet.createRow(i+1);row.createCell(0).setCellValue(q.content());row.createCell(1).setCellValue(q.questionType().name());
                for(int j=0;j<Math.min(OPTION_COUNT,q.options().size());j++){var option=q.options().get(j);row.createCell(2+j*2).setCellValue(option.content());row.createCell(3+j*2).setCellValue(option.correct());}
            }
            workbook.write(out);return out.toByteArray();
        }catch(IOException ex){throw new IllegalStateException("Could not create Excel export",ex);}
    }

    public byte[] template(){
        try(Workbook workbook=new XSSFWorkbook();ByteArrayOutputStream out=new ByteArrayOutputStream()){
            Sheet sheet=workbook.createSheet("Questions");writeHeader(sheet);Row example=sheet.createRow(1);example.createCell(0).setCellValue("2 + 2 bằng bao nhiêu?");example.createCell(1).setCellValue("SINGLE_CHOICE");example.createCell(2).setCellValue("4");example.createCell(3).setCellValue(true);example.createCell(4).setCellValue("5");example.createCell(5).setCellValue(false);
            workbook.write(out);return out.toByteArray();
        }catch(IOException ex){throw new IllegalStateException("Could not create Excel template",ex);}
    }

    private List<ImportRow> readRows(MultipartFile file){
        try(Workbook workbook=WorkbookFactory.create(file.getInputStream())){
            Sheet sheet=workbook.getSheetAt(0);if(sheet.getLastRowNum()<1)throw new InvalidRequestException("Excel không có dòng câu hỏi nào");
            DataFormatter formatter=new DataFormatter(Locale.ROOT);List<ImportRow> parsed=new ArrayList<>();
            for(int index=1;index<=sheet.getLastRowNum();index++){
                Row row=sheet.getRow(index);if(row==null)continue;String content=value(row,0,formatter).trim();String rawType=value(row,1,formatter).trim();
                if(content.isBlank()&&rawType.isBlank())continue;
                if(content.isBlank())throw new InvalidRequestException("Dòng "+(index+1)+": thiếu nội dung câu hỏi");
                QuestionType type;try{type=QuestionType.valueOf(rawType.trim().toUpperCase(Locale.ROOT).replace(' ','_'));}catch(Exception ex){throw new InvalidRequestException("Dòng "+(index+1)+": loại câu hỏi phải là SINGLE_CHOICE, MULTIPLE_CHOICE hoặc SHORT_ANSWER");}
                List<QuestionOptionRequest> options=new ArrayList<>();
                for(int option=0;option<OPTION_COUNT;option++){
                    String text=value(row,2+option*2,formatter).trim();String correct=value(row,3+option*2,formatter).trim();
                    if(text.isBlank())continue;
                    boolean isCorrect=type==QuestionType.SHORT_ANSWER||parseCorrect(correct,index+1);
                    options.add(new QuestionOptionRequest(text,isCorrect));
                }
                if(options.isEmpty())throw new InvalidRequestException("Dòng "+(index+1)+": cần ít nhất một đáp án");
                parsed.add(new ImportRow(index+1,content,type,options));
            }
            if(parsed.isEmpty())throw new InvalidRequestException("Excel không có dòng câu hỏi nào");
            return parsed;
        }catch(InvalidRequestException ex){throw ex;}catch(Exception ex){throw new InvalidRequestException("Không đọc được Excel. Hãy dùng tệp .xlsx/.xls theo mẫu.");}
    }
    private boolean parseCorrect(String value,int row){return switch(value.toLowerCase(Locale.ROOT)){case "true","1","yes","y","đúng","x"->true;case "false","0","no","n","sai",""->false;default->throw new InvalidRequestException("Dòng "+row+": cột đáp án đúng chỉ nhận true/false hoặc Đúng/Sai");};}
    private String value(Row row,int cell,DataFormatter formatter){Cell item=row.getCell(cell,Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);return item==null?"":formatter.formatCellValue(item);}
    private void requireExcel(MultipartFile file){if(file==null||file.isEmpty())throw new InvalidRequestException("Chưa chọn tệp Excel");String name=file.getOriginalFilename();if(name==null||!(name.toLowerCase(Locale.ROOT).endsWith(".xlsx")||name.toLowerCase(Locale.ROOT).endsWith(".xls")))throw new InvalidRequestException("Chỉ hỗ trợ tệp .xlsx hoặc .xls");}
    private void writeHeader(Sheet sheet){Row header=sheet.createRow(0);header.createCell(0).setCellValue("Nội dung câu hỏi");header.createCell(1).setCellValue("Loại câu hỏi");for(int i=1;i<=OPTION_COUNT;i++){header.createCell(2+(i-1)*2).setCellValue("Đáp án "+i);header.createCell(3+(i-1)*2).setCellValue("Đúng "+i);}header.createCell(22).setCellValue("Ghi chú: SHORT_ANSWER coi mọi đáp án có nội dung là đáp án đúng.");sheet.createFreezePane(0,1);sheet.setAutoFilter(new org.apache.poi.ss.util.CellRangeAddress(0,0,0,21));for(int i=0;i<22;i++)sheet.setColumnWidth(i,i<2?26*256:16*256);}
    private record ImportRow(int rowNumber,String content,QuestionType type,List<QuestionOptionRequest> options){}
}
