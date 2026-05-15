package com.ibrahim.parcvision.service;

import java.io.File;

public interface OCRService {
    /**
     * Extracts text from the given file using OCR.
     * @param file The file to process (image or PDF)
     * @return The extracted text, or an empty string/null if it fails.
     */
    String extractText(File file);

    /**
     * Asynchronously process OCR for a document and update the database.
     */
    void processOCRAsync(Long documentId);
}
