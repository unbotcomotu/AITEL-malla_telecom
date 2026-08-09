package org.example.comentariosservice.Dto;

import org.example.comentariosservice.Model.NivelDificultad;

public class DifficultySummaryResponse {
    private double average;
    private long count;
    /** EASY | MEDIUM | HARD | VERY_HARD, o null si nadie ha votado todavia. */
    private NivelDificultad level;
    private String levelLabel;
    /** Lo que voto quien consulta, o null si aun no vota. */
    private Integer myRating;

    public DifficultySummaryResponse(double average, long count, Integer myRating) {
        this.average = average;
        this.count = count;
        this.level = NivelDificultad.desdePromedio(average);
        this.levelLabel = this.level == null ? null : this.level.getEtiqueta();
        this.myRating = myRating;
    }

    public double getAverage() {
        return average;
    }

    public long getCount() {
        return count;
    }

    public NivelDificultad getLevel() {
        return level;
    }

    public String getLevelLabel() {
        return levelLabel;
    }

    public Integer getMyRating() {
        return myRating;
    }
}
