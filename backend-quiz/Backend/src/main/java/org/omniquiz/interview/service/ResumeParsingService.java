package org.omniquiz.interview.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.omniquiz.interview.dto.ResumeParseResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ResumeParsingService {

    private static final Logger logger = LoggerFactory.getLogger(ResumeParsingService.class);

    private static final long MAX_FILE_SIZE_BYTES = 5L * 1024 * 1024;
    private static final int MAX_RESUME_TEXT_CHARS = 12_000;

    public ResumeParseResponse parseResume(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resume file is required.");
        }

        String fileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "resume";
        String extension = extractExtension(fileName);

        if (!"pdf".equals(extension) && !"docx".equals(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only PDF and DOCX files are supported.");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Resume file size must be 5MB or less.");
        }

        try {
            String extractedText = "pdf".equals(extension)
                    ? extractFromPdf(file.getInputStream())
                    : extractFromDocx(file.getInputStream());

            String normalized = normalizeText(extractedText);
            if (normalized.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Unable to extract meaningful text from the uploaded resume.");
            }

            boolean truncated = false;
            if (normalized.length() > MAX_RESUME_TEXT_CHARS) {
                normalized = normalized.substring(0, MAX_RESUME_TEXT_CHARS);
                truncated = true;
            }

            logger.info("Resume parsed successfully. File: {}, characters: {}, truncated: {}",
                    fileName, normalized.length(), truncated);
            return new ResumeParseResponse(fileName, normalized, normalized.length(), truncated);
        } catch (IOException e) {
            logger.error("Failed to parse resume file: {}", fileName, e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Failed to parse resume. Please upload a valid PDF or DOCX file.");
        }
    }

    private String extractFromPdf(InputStream inputStream) throws IOException {
        try (PDDocument document = PDDocument.load(inputStream)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    private String extractFromDocx(InputStream inputStream) throws IOException {
        try (XWPFDocument document = new XWPFDocument(inputStream);
             XWPFWordExtractor extractor = new XWPFWordExtractor(document)) {
            return extractor.getText();
        }
    }

    private String normalizeText(String rawText) {
        if (rawText == null) {
            return "";
        }
        String controlSanitized = rawText
                .replace("\r\n", "\n")
                .replace("\r", "\n")
                .replaceAll("[\\p{Cntrl}&&[^\n\t]]", " ");

        String collapsedWhitespace = controlSanitized.replaceAll("[ \t]+", " ");

        return Arrays.stream(collapsedWhitespace.split("\n"))
                .map(String::trim)
                .filter(line -> !line.isBlank())
                .collect(Collectors.joining("\n"))
                .trim();
    }

    private String extractExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            return "";
        }
        return fileName.substring(dotIndex + 1).toLowerCase(Locale.ROOT);
    }
}
