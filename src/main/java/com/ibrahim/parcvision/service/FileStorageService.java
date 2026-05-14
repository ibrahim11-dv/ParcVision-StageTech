package com.ibrahim.parcvision.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.*;

@Service
public class FileStorageService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public String storeFile(MultipartFile file, String subFolder, String customFileName) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // 1. Créer le sous-dossier spécifique au conducteur (s'il n'existe pas)
        Path uploadPath = Paths.get(uploadDir, subFolder);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // 2. Extraire l'extension du fichier original (ex: .png, .pdf)
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
        String fileExtension = "";
        if (originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }

        // 3. Combiner le nom voulu avec l'extension (ex: photo_profile.png)
        String finalFileName = customFileName + fileExtension;

        // 4. Sauvegarder physiquement le fichier
        Path filePath = uploadPath.resolve(finalFileName);
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

        // 5. Retourner le chemin URL relatif pour la base de données
        return uploadDir + "/" + subFolder + "/" + finalFileName;
    }

    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;
        try {
            Path filePath = Paths.get(fileUrl);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Loguer l'erreur sans bloquer le processus
            System.err.println("Impossible de supprimer le fichier : " + fileUrl);
        }
    }

}
