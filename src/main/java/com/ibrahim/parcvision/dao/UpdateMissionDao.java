package com.ibrahim.parcvision.dao;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

public class UpdateMissionDao extends AddMissionDao {
    @NotNull
    private Long id;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}
