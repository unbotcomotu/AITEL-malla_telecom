package org.example.cursosservice.Service;

import org.example.cursosservice.Client.UsuarioServiceClient;
import org.example.cursosservice.Repository.CategoriaRepository;
import org.example.cursosservice.Repository.CursoRepository;
import org.example.cursosservice.Repository.SubcategoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final CursoRepository cursoRepository;
    private final CategoriaRepository categoriaRepository;
    private final SubcategoriaRepository subcategoriaRepository;
    private final UsuarioServiceClient usuarioServiceClient;

    public DashboardServiceImpl(CursoRepository cursoRepository,
                                 CategoriaRepository categoriaRepository,
                                 SubcategoriaRepository subcategoriaRepository,
                                 UsuarioServiceClient usuarioServiceClient) {
        this.cursoRepository = cursoRepository;
        this.categoriaRepository = categoriaRepository;
        this.subcategoriaRepository = subcategoriaRepository;
        this.usuarioServiceClient = usuarioServiceClient;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getStats() {
        Map<String, Long> userCounts = usuarioServiceClient.getUserCounts();

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalCourses", cursoRepository.count());
        stats.put("totalCategories", categoriaRepository.count());
        stats.put("totalSubcategories", subcategoriaRepository.count());
        stats.put("totalProfessors", userCounts.getOrDefault("professors", 0L));
        stats.put("activeStudents", userCounts.getOrDefault("students", 0L));
        return stats;
    }

    @Override
    public List<Map<String, Object>> getRecentActivity(int limit) {
        // No existe todavia una bitacora de auditoria (creaciones/ediciones) en ningun
        // servicio del backend; se devuelve vacio en vez de inventar datos.
        return Collections.emptyList();
    }
}
