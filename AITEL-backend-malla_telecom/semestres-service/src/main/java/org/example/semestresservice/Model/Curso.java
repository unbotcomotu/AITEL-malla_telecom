package org.example.semestresservice.Model;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO que refleja la forma real del JSON que expone cursos-service
 * (CursoResponse). Se llena via Feign, nunca se persiste.
 */
public class Curso {
    private Long id;
    private String code;
    private String name;
    private String description;
    private BigDecimal credits;
    private Long cycle;
    private Long subcategoryId;
    private String subcategoryName;
    private Integer subcategoryRequiredCourses;
    private Boolean subcategoryRequiresAll;
    private Integer subcategoryTotalCourses;
    private Long categoryId;
    private String categoryName;
    private Boolean isHidden;
    private List<Prerequisite> prerequisites;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getCredits() {
        return credits;
    }

    public void setCredits(BigDecimal credits) {
        this.credits = credits;
    }

    public Long getCycle() {
        return cycle;
    }

    public void setCycle(Long cycle) {
        this.cycle = cycle;
    }

    public Long getSubcategoryId() {
        return subcategoryId;
    }

    public void setSubcategoryId(Long subcategoryId) {
        this.subcategoryId = subcategoryId;
    }

    public String getSubcategoryName() {
        return subcategoryName;
    }

    public void setSubcategoryName(String subcategoryName) {
        this.subcategoryName = subcategoryName;
    }

    public Integer getSubcategoryRequiredCourses() {
        return subcategoryRequiredCourses;
    }

    public void setSubcategoryRequiredCourses(Integer subcategoryRequiredCourses) {
        this.subcategoryRequiredCourses = subcategoryRequiredCourses;
    }

    public Boolean getSubcategoryRequiresAll() {
        return subcategoryRequiresAll;
    }

    public void setSubcategoryRequiresAll(Boolean subcategoryRequiresAll) {
        this.subcategoryRequiresAll = subcategoryRequiresAll;
    }

    public Integer getSubcategoryTotalCourses() {
        return subcategoryTotalCourses;
    }

    public void setSubcategoryTotalCourses(Integer subcategoryTotalCourses) {
        this.subcategoryTotalCourses = subcategoryTotalCourses;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Boolean getIsHidden() {
        return isHidden;
    }

    public void setIsHidden(Boolean isHidden) {
        this.isHidden = isHidden;
    }

    public List<Prerequisite> getPrerequisites() {
        return prerequisites;
    }

    public void setPrerequisites(List<Prerequisite> prerequisites) {
        this.prerequisites = prerequisites;
    }

    public static class Prerequisite {
        private Long id;
        private Long source;
        private Long target;
        private String type;
        private Integer minGrade;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public Long getSource() {
            return source;
        }

        public void setSource(Long source) {
            this.source = source;
        }

        public Long getTarget() {
            return target;
        }

        public void setTarget(Long target) {
            this.target = target;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public Integer getMinGrade() {
            return minGrade;
        }

        public void setMinGrade(Integer minGrade) {
            this.minGrade = minGrade;
        }
    }
}
