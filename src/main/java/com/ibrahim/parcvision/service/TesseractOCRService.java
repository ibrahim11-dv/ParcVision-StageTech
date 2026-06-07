package com.ibrahim.parcvision.service;

import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import com.ibrahim.parcvision.repository.DocumentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.logging.Level;
import java.util.logging.Logger;

@Service
public class TesseractOCRService implements OCRService {

    private static final Logger LOGGER = Logger.getLogger(TesseractOCRService.class.getName());

    private final DocumentRepository documentRepo;

    @Value("${ocr.tessdata.path:C:/Program Files/Tesseract-OCR/tessdata}")
    private String tessdataPath;

    public TesseractOCRService(DocumentRepository documentRepo) {
        this.documentRepo = documentRepo;
    }

    @Override
    public String extractText(File file) {
        if (file == null || !file.exists()) {
            LOGGER.warning("OCR skipped: File does not exist.");
            return "";
        }

        // Tesseract only supports certain file types. We'll try to process images.
        // For PDFs, Tess4J usually handles them if Ghostscript is installed, 
        // but it's safer to check extension or rely on Tesseract's internal handling.
        
        Tesseract tesseract = new Tesseract();
        
        // Point to the tessdata folder (containing .traineddata files)
        tesseract.setDatapath(tessdataPath);
        
        // Set language (default is eng, can be fra+eng)
        tesseract.setLanguage("fra+eng");

        try {
            LOGGER.info("Starting OCR on file: " + file.getAbsolutePath());
            String result = tesseract.doOCR(file);
            LOGGER.info("OCR completed successfully.");
            return result;
        } catch (TesseractException e) {
            LOGGER.log(Level.SEVERE, "Error during OCR processing", e);
            return "Error extracting text: " + e.getMessage();
        } catch (Error e) {
            LOGGER.log(Level.SEVERE, "Native Tesseract library error. Is Tesseract installed?", e);
            return "OCR error: Tesseract binaries not found on system.";
        }
    }

    @Override
    @Async
    @Transactional
    public void processOCRAsync(Long documentId) {
        documentRepo.findById(documentId).ifPresent(doc -> {
            try {
                String path = doc.getCheminStockage();
                if (path != null) {
                    File file = new File(path);
                    String text = this.extractText(file);
                    doc.setOcrContent(text);
                    documentRepo.save(doc);
                }
            } catch (Exception e) {
                LOGGER.log(Level.SEVERE, "OCR Background Task failed for document " + documentId, e);
            }
        });
    }
}
