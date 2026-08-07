package org.example.cursosservice.Service;

import java.util.List;
import java.util.Map;

public interface SearchService {

    Map<String, Object> getFilters();

    List<Map<String, Object>> search(String query, List<String> types, List<String> status,
                                      List<Long> cycles, List<Long> categories, String sortBy);
}
