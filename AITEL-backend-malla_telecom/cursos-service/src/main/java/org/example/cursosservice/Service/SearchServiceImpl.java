package org.example.cursosservice.Service;

import org.example.cursosservice.Client.UsuarioServiceClient;
import org.example.cursosservice.Model.Entity.Categoria;
import org.example.cursosservice.Model.Entity.Curso;
import org.example.cursosservice.Model.Entity.Subcategoria;
import org.example.cursosservice.Repository.CategoriaRepository;
import org.example.cursosservice.Repository.CursoRepository;
import org.example.cursosservice.Repository.SubcategoriaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class SearchServiceImpl implements SearchService {

    private static final String[] TYPE_COLORS = {"#1979C3", "#0B3B5C", "#2E8B57", "#C97A1D"};

    private final CategoriaRepository categoriaRepository;
    private final SubcategoriaRepository subcategoriaRepository;
    private final CursoRepository cursoRepository;
    private final UsuarioServiceClient usuarioServiceClient;

    public SearchServiceImpl(CategoriaRepository categoriaRepository,
                              SubcategoriaRepository subcategoriaRepository,
                              CursoRepository cursoRepository,
                              UsuarioServiceClient usuarioServiceClient) {
        this.categoriaRepository = categoriaRepository;
        this.subcategoriaRepository = subcategoriaRepository;
        this.cursoRepository = cursoRepository;
        this.usuarioServiceClient = usuarioServiceClient;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getFilters() {
        Map<String, Object> filters = new LinkedHashMap<>();
        filters.put("types", List.of(
                typeFilter("category", "Categorías", "📂", TYPE_COLORS[0]),
                typeFilter("subcategory", "Subcategorías", "📁", TYPE_COLORS[1]),
                typeFilter("course", "Cursos", "📚", TYPE_COLORS[2]),
                typeFilter("professor", "Profesores", "👨‍🏫", TYPE_COLORS[3])
        ));
        filters.put("status", List.of(
                statusFilter("active", "Activo", "#2E8B57"),
                statusFilter("inactive", "Inactivo", "#C0392B")
        ));

        List<Map<String, Object>> cycles = new ArrayList<>();
        for (long cycle = 1; cycle <= 10; cycle++) {
            Map<String, Object> cycleFilter = new LinkedHashMap<>();
            cycleFilter.put("id", cycle);
            cycles.add(cycleFilter);
        }
        filters.put("cycles", cycles);

        List<Map<String, Object>> categories = new ArrayList<>();
        List<Categoria> allCategorias = categoriaRepository.findAll();
        for (int i = 0; i < allCategorias.size(); i++) {
            Categoria categoria = allCategorias.get(i);
            Map<String, Object> categoryFilter = new LinkedHashMap<>();
            categoryFilter.put("id", categoria.getId());
            categoryFilter.put("name", categoria.getCategoria());
            categoryFilter.put("color", TYPE_COLORS[i % TYPE_COLORS.length]);
            categories.add(categoryFilter);
        }
        filters.put("categories", categories);

        return filters;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> search(String query, List<String> types, List<String> status,
                                             List<Long> cycles, List<Long> categories, String sortBy) {
        String q = query == null ? "" : query.toLowerCase(Locale.ROOT).trim();
        List<Map<String, Object>> results = new ArrayList<>();

        List<Categoria> allCategorias = categoriaRepository.findAll();
        List<Subcategoria> allSubcategorias = subcategoriaRepository.findAll();
        List<Curso> allCursos = cursoRepository.findAll();

        if (includeType(types, "category")) {
            for (Categoria categoria : allCategorias) {
                if (categories != null && !categories.isEmpty() && !categories.contains(categoria.getId())) {
                    continue;
                }
                if (!matches(q, categoria.getCategoria(), null)) {
                    continue;
                }
                long subcategoriasCount = allSubcategorias.stream()
                        .filter(s -> s.getCategoria().getId().equals(categoria.getId())).count();
                long coursesCount = allCursos.stream()
                        .filter(c -> c.getSubcategoria() != null
                                && c.getSubcategoria().getCategoria().getId().equals(categoria.getId()))
                        .count();

                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", categoria.getId());
                item.put("type", "category");
                item.put("name", categoria.getCategoria());
                item.put("subcategoriesCount", subcategoriasCount);
                item.put("coursesCount", coursesCount);
                results.add(item);
            }
        }

        if (includeType(types, "subcategory")) {
            for (Subcategoria subcategoria : allSubcategorias) {
                if (categories != null && !categories.isEmpty() && !categories.contains(subcategoria.getCategoria().getId())) {
                    continue;
                }
                if (!matches(q, subcategoria.getSubcategoria(), null)) {
                    continue;
                }
                long coursesCount = allCursos.stream()
                        .filter(c -> c.getSubcategoria() != null && c.getSubcategoria().getId().equals(subcategoria.getId()))
                        .count();

                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", subcategoria.getId());
                item.put("type", "subcategory");
                item.put("name", subcategoria.getSubcategoria());
                item.put("categoryName", subcategoria.getCategoria().getCategoria());
                item.put("coursesCount", coursesCount);
                results.add(item);
            }
        }

        if (includeType(types, "course")) {
            for (Curso curso : allCursos) {
                Long categoryId = curso.getSubcategoria() != null && curso.getSubcategoria().getCategoria() != null
                        ? curso.getSubcategoria().getCategoria().getId() : null;
                if (categories != null && !categories.isEmpty() && (categoryId == null || !categories.contains(categoryId))) {
                    continue;
                }
                if (cycles != null && !cycles.isEmpty() && !cycles.contains(curso.getCiclo())) {
                    continue;
                }
                boolean isActive = !Boolean.TRUE.equals(curso.getOculta());
                if (status != null && !status.isEmpty()) {
                    boolean wantsActive = status.contains("active");
                    boolean wantsInactive = status.contains("inactive");
                    if (!((isActive && wantsActive) || (!isActive && wantsInactive))) {
                        continue;
                    }
                }
                if (!matches(q, curso.getNombre(), curso.getCodigo())) {
                    continue;
                }

                int totalHours = curso.getHorasTeoria() + curso.getHorasPractica() + curso.getHorasLaboratorio();
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", curso.getId());
                item.put("type", "course");
                item.put("code", curso.getCodigo());
                item.put("name", curso.getNombre());
                item.put("description", curso.getDescripcion());
                item.put("credits", curso.getCreditos());
                item.put("cycle", curso.getCiclo());
                item.put("totalHours", totalHours);
                item.put("isActive", isActive);
                if (curso.getSubcategoria() != null) {
                    item.put("subcategoryName", curso.getSubcategoria().getSubcategoria());
                    if (curso.getSubcategoria().getCategoria() != null) {
                        item.put("categoryName", curso.getSubcategoria().getCategoria().getCategoria());
                    }
                }
                results.add(item);
            }
        }

        if (includeType(types, "professor")) {
            List<UsuarioServiceClient.ProfessorDto> professors = usuarioServiceClient.getAllProfessors();
            for (UsuarioServiceClient.ProfessorDto professor : professors) {
                if (!matches(q, professor.getFullName(), professor.getEmail())) {
                    continue;
                }
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("id", professor.getId());
                item.put("type", "professor");
                item.put("name", professor.getFullName());
                item.put("description", professor.getEmail());
                item.put("totalCourses", 0);
                item.put("activeCycles", List.of());
                results.add(item);
            }
        }

        sort(results, sortBy);
        return results;
    }

    private boolean includeType(List<String> types, String type) {
        return types == null || types.isEmpty() || types.contains(type);
    }

    private boolean matches(String q, String primary, String secondary) {
        if (q.isEmpty()) {
            return true;
        }
        if (primary != null && primary.toLowerCase(Locale.ROOT).contains(q)) {
            return true;
        }
        return secondary != null && secondary.toLowerCase(Locale.ROOT).contains(q);
    }

    private void sort(List<Map<String, Object>> results, String sortBy) {
        if (sortBy == null) {
            return;
        }
        Comparator<Map<String, Object>> comparator = switch (sortBy) {
            case "name" -> Comparator.comparing(item -> String.valueOf(item.getOrDefault("name", "")), String.CASE_INSENSITIVE_ORDER);
            case "cycle" -> Comparator.comparing(item -> {
                Object cycle = item.get("cycle");
                return cycle == null ? Long.MAX_VALUE : ((Number) cycle).longValue();
            });
            case "credits" -> Comparator.comparing(item -> {
                Object credits = item.get("credits");
                return credits == null ? 0.0 : ((Number) credits).doubleValue();
            }, Comparator.reverseOrder());
            default -> null;
        };
        if (comparator != null) {
            results.sort(comparator);
        }
    }

    private Map<String, Object> typeFilter(String id, String name, String icon, String color) {
        Map<String, Object> filter = new LinkedHashMap<>();
        filter.put("id", id);
        filter.put("name", name);
        filter.put("icon", icon);
        filter.put("color", color);
        return filter;
    }

    private Map<String, Object> statusFilter(String id, String name, String color) {
        Map<String, Object> filter = new LinkedHashMap<>();
        filter.put("id", id);
        filter.put("name", name);
        filter.put("color", color);
        return filter;
    }
}
