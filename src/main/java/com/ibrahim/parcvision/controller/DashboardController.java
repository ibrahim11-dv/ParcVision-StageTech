package com.ibrahim.parcvision.controller;

import com.ibrahim.parcvision.dao.DashboardStatsDao;
import com.ibrahim.parcvision.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDao> getStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }
}
