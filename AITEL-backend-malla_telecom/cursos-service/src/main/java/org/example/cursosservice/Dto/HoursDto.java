package org.example.cursosservice.Dto;

public class HoursDto {
    private Integer theory;
    private Integer practice;
    private Integer lab;

    public HoursDto() {
    }

    public HoursDto(Integer theory, Integer practice, Integer lab) {
        this.theory = theory;
        this.practice = practice;
        this.lab = lab;
    }

    public Integer getTheory() {
        return theory;
    }

    public void setTheory(Integer theory) {
        this.theory = theory;
    }

    public Integer getPractice() {
        return practice;
    }

    public void setPractice(Integer practice) {
        this.practice = practice;
    }

    public Integer getLab() {
        return lab;
    }

    public void setLab(Integer lab) {
        this.lab = lab;
    }
}
