package org.example.semestresservice.Dto;

import org.example.semestresservice.Model.TipoHorario;

import java.util.List;

public class ScheduleRequest {
    /** Codigo de la seccion, p.ej. "0401". */
    private String schedule;
    /** Codigo de la seccion de clase a la que se ata esta (columna "Hor. Aso"). */
    private String associatedSchedule;
    private TipoHorario type;

    public String getAssociatedSchedule() {
        return associatedSchedule;
    }

    public void setAssociatedSchedule(String associatedSchedule) {
        this.associatedSchedule = associatedSchedule;
    }
    private List<Long> professorIds;
    private List<BloqueRequest> blocks;

    public String getSchedule() {
        return schedule;
    }

    public void setSchedule(String schedule) {
        this.schedule = schedule;
    }

    public TipoHorario getType() {
        return type;
    }

    public void setType(TipoHorario type) {
        this.type = type;
    }

    public List<Long> getProfessorIds() {
        return professorIds;
    }

    public void setProfessorIds(List<Long> professorIds) {
        this.professorIds = professorIds;
    }

    public List<BloqueRequest> getBlocks() {
        return blocks;
    }

    public void setBlocks(List<BloqueRequest> blocks) {
        this.blocks = blocks;
    }

    public static class BloqueRequest {
        /** 1 = lunes ... 7 = domingo. */
        private Integer day;
        /** Formato "HH:mm". */
        private String startTime;
        private String endTime;
        private String classroom;

        public Integer getDay() {
            return day;
        }

        public void setDay(Integer day) {
            this.day = day;
        }

        public String getStartTime() {
            return startTime;
        }

        public void setStartTime(String startTime) {
            this.startTime = startTime;
        }

        public String getEndTime() {
            return endTime;
        }

        public void setEndTime(String endTime) {
            this.endTime = endTime;
        }

        public String getClassroom() {
            return classroom;
        }

        public void setClassroom(String classroom) {
            this.classroom = classroom;
        }
    }
}
