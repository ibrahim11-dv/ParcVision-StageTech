package com.ibrahim.parcvision.enums;

public enum TypePaiement {
    CARTE_CREDIT("Carte de crédit"),
    ESPECES("Espèces"),
    VIREMENT_BANCAIRE("Virement bancaire"),
    CHEQUE("Chèque"),
    EN_ATTENTE("En attente"),
    PAYE("Payé");

    private final String display;

    TypePaiement(String display) {
        this.display = display;
    }

    public String getDisplay() {
        return display;
    }
}
