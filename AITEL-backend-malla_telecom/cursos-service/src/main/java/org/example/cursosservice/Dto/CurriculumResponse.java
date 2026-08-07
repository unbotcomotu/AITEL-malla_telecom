package org.example.cursosservice.Dto;

import java.util.List;
import java.util.Map;

public class CurriculumResponse {
    private List<CurriculumNodeResponse> nodes;
    private List<PrerequisiteResponse> edges;
    private Map<String, String> prerequisiteTypes;

    public CurriculumResponse(List<CurriculumNodeResponse> nodes, List<PrerequisiteResponse> edges, Map<String, String> prerequisiteTypes) {
        this.nodes = nodes;
        this.edges = edges;
        this.prerequisiteTypes = prerequisiteTypes;
    }

    public List<CurriculumNodeResponse> getNodes() {
        return nodes;
    }

    public List<PrerequisiteResponse> getEdges() {
        return edges;
    }

    public Map<String, String> getPrerequisiteTypes() {
        return prerequisiteTypes;
    }
}
