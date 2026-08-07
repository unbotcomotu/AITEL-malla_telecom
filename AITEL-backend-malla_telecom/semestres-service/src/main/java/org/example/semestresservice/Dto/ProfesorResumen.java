package org.example.semestresservice.Dto;

public class ProfesorResumen {
    private Long id;
    private String fullName;

    public ProfesorResumen(Long id, String fullName) {
        this.id = id;
        this.fullName = fullName;
    }

    public Long getId() {
        return id;
    }

    public String getFullName() {
        return fullName;
    }
}
