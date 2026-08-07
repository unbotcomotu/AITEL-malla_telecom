package org.example.cursosservice.Service;

import java.util.List;
import java.util.Map;

public interface DashboardService {

    Map<String, Object> getStats();

    List<Map<String, Object>> getRecentActivity(int limit);
}
