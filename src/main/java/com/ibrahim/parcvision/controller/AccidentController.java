package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.entity.Accident;
import com.ibrahim.parcvision.repository.AccidentRepository;
import com.ibrahim.parcvision.service.AccidentService;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
public class AccidentController {

    private final AccidentService accidentService;

    public AccidentController(AccidentService accidentService) {
        this.accidentService = accidentService;
    }


    @GetMapping("/admin/count")
    public long countAccident(){
        return accidentService.countAccident();
    }

    @GetMapping("/admin/countByEtat")
    public long countAccidentByEtat(){
        return accidentService.getNombreEnReparation();
    }

    @GetMapping("/admin/SumBudget")
    public double SumBudget(){
        return accidentService.getTotalBudget();
    }

    @GetMapping("/admin/search")
    public List<Accident> SearchCond(@RequestParam String query){
        return accidentService.Search(query);
    }

    @GetMapping("/admin/findByEtat")
    public List<Accident> findEtat(@RequestParam String etat){
        return accidentService.findByetat(etat);
    }

    @GetMapping("/admin")
    public List<Accident> findall(){
        return accidentService.AffichAll();
    }

    @PutMapping("/admin/update/{id}")
    public ResponseEntity<Accident> updateAccident(
            @PathVariable Long id,
            @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(accidentService.updateAccident(id, updates));
    }

    @PostMapping("/admin/Add")
    public Accident AddAccident(@RequestBody Accident accident){
        return accidentService.saveAccident(accident);
    }
}
