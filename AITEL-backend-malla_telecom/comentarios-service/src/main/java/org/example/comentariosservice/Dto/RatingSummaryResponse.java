package org.example.comentariosservice.Dto;

public class RatingSummaryResponse {
    private double average;
    private long count;

    public RatingSummaryResponse(double average, long count) {
        this.average = average;
        this.count = count;
    }

    public double getAverage() {
        return average;
    }

    public long getCount() {
        return count;
    }
}
