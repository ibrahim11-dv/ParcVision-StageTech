package com.ibrahim.parcvision.enums;

public enum Role {
    CONDUCTEUR("ROLE_CONDUCTEUR"),
    ADMIN("ROLE_ADMIN");

    Role(String roleConducteur) {
    }

    public String getRole() {
        return this.name();
    }
}
