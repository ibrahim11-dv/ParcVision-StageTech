package com.ibrahim.parcvision.service;

import com.ibrahim.parcvision.entity.Depannage;
import com.ibrahim.parcvision.repository.DepannageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class DepannageService {

    private final DepannageRepository depannageRepository;

    public DepannageService(DepannageRepository depannageRepository) {
        this.depannageRepository = depannageRepository;
    }

    public Page<Depannage> findAll(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return depannageRepository.findAll(pageable);
    }

    public Page<Depannage> search(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return depannageRepository.search(query, pageable);
    }

    public Page<Depannage> findByStatut(String statut, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("dateIntervention").descending());
        return depannageRepository.findByStatut(statut, pageable);
    }

    public Depannage save(Depannage depannage) {
        return depannageRepository.save(depannage);
    }

    public void delete(Long id) {
        depannageRepository.deleteById(id);
    }

    public Depannage update(Long id, Map<String, Object> updates) {
        Depannage depannage = depannageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dépannage non trouvé"));

        if (updates.containsKey("statut")) depannage.setStatut((String) updates.get("statut"));
        if (updates.containsKey("lieuPanne")) depannage.setLieuPanne((String) updates.get("lieuPanne"));
        if (updates.containsKey("descriptionPanne")) depannage.setDescriptionPanne((String) updates.get("descriptionPanne"));
        if (updates.containsKey("coutTotal")) depannage.setCoutTotal(Double.parseDouble(updates.get("coutTotal").toString()));

        return depannageRepository.save(depannage);
    }

    public long countTotal() { return depannageRepository.countTotal(); }
    public long countEnCours() { return depannageRepository.countEnCours(); }
    public double sumFrais() {
        Double sum = depannageRepository.sumFrais();
        return sum != null ? sum : 0.0;
    }
}
