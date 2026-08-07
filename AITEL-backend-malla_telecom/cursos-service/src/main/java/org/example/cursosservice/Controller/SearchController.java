package org.example.cursosservice.Controller;

import org.example.cursosservice.Service.SearchService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/filters")
    public Map<String, Object> getFilters() {
        return searchService.getFilters();
    }

    @GetMapping
    public List<Map<String, Object>> search(@RequestParam(value = "q", required = false, defaultValue = "") String query,
                                             @RequestParam(value = "types", required = false, defaultValue = "") String types,
                                             @RequestParam(value = "status", required = false, defaultValue = "") String status,
                                             @RequestParam(value = "cycles", required = false, defaultValue = "") String cycles,
                                             @RequestParam(value = "categories", required = false, defaultValue = "") String categories,
                                             @RequestParam(value = "sortBy", required = false, defaultValue = "relevance") String sortBy) {
        return searchService.search(query, splitStrings(types), splitStrings(status),
                splitLongs(cycles), splitLongs(categories), sortBy);
    }

    private List<String> splitStrings(String value) {
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    private List<Long> splitLongs(String value) {
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::valueOf)
                .toList();
    }
}
