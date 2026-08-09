package org.example.semestresservice.Service;

import org.example.semestresservice.Client.CursoServiceClient;
import org.example.semestresservice.Client.UsuarioServiceClient;
import org.example.semestresservice.Dto.AcademicInfoResponse;
import org.example.semestresservice.Dto.CourseHistoryEntry;
import org.example.semestresservice.Dto.CurrentCourseResponse;
import org.example.semestresservice.Dto.RegisterSemesterRequest;
import org.example.semestresservice.Dto.SeccionResumen;
import org.example.semestresservice.Dto.SemesterHistoryEntry;
import org.example.semestresservice.Dto.ValidatePrerequisitesRequest;
import org.example.semestresservice.Dto.ValidationResponse;
import org.example.semestresservice.Exception.ApiException;
import org.example.semestresservice.Model.Curso;
import org.example.semestresservice.Model.Entity.AlumnoSemestre;
import org.example.semestresservice.Model.Entity.Horario;
import org.example.semestresservice.Model.Entity.MatriculaAlumno;
import org.example.semestresservice.Model.Entity.MatriculaHorario;
import org.example.semestresservice.Model.Entity.Semestre;
import org.example.semestresservice.Model.PrerequisiteTypes;
import org.example.semestresservice.Model.TipoHorario;
import org.example.semestresservice.Model.Usuario;
import org.example.semestresservice.Repository.AlumnoSemestreRepository;
import org.example.semestresservice.Repository.HorarioRepository;
import org.example.semestresservice.Repository.MatriculaAlumnoRepository;
import org.example.semestresservice.Repository.SemestreRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class StudentServiceImpl implements StudentService {

    private final MatriculaAlumnoRepository matriculaRepository;
    private final HorarioRepository horarioRepository;
    private final SemestreRepository semestreRepository;
    private final AlumnoSemestreRepository alumnoSemestreRepository;
    private final CursoServiceClient cursoServiceClient;
    private final UsuarioServiceClient usuarioServiceClient;

    public StudentServiceImpl(MatriculaAlumnoRepository matriculaRepository,
                               HorarioRepository horarioRepository,
                               SemestreRepository semestreRepository,
                               AlumnoSemestreRepository alumnoSemestreRepository,
                               CursoServiceClient cursoServiceClient,
                               UsuarioServiceClient usuarioServiceClient) {
        this.matriculaRepository = matriculaRepository;
        this.horarioRepository = horarioRepository;
        this.semestreRepository = semestreRepository;
        this.alumnoSemestreRepository = alumnoSemestreRepository;
        this.cursoServiceClient = cursoServiceClient;
        this.usuarioServiceClient = usuarioServiceClient;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, Long> getGrades(Long userId) {
        Map<Long, Long> grades = new LinkedHashMap<>();
        for (MatriculaAlumno registro : matriculaRepository.findByIdAlumno(userId)) {
            if (registro.getNotaFinal() != null) {
                grades.put(registro.getIdCurso(), registro.getNotaFinal());
            }
        }
        return grades;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CurrentCourseResponse> getCurrentCourses(Long userId) {
        Map<Long, Curso> cache = new HashMap<>();
        List<CurrentCourseResponse> resultado = new ArrayList<>();
        for (MatriculaAlumno registro : matriculaRepository.findByIdAlumno(userId)) {
            if (Boolean.TRUE.equals(registro.getSemestre().getActivo())) {
                Curso curso = obtenerCurso(cache, registro.getIdCurso());
                resultado.add(new CurrentCourseResponse(
                        registro.getIdCurso(),
                        curso == null ? null : curso.getCode(),
                        curso == null ? null : curso.getName(),
                        curso == null ? null : curso.getCredits(),
                        // El codigo de seccion solo existe si el alumno registro
                        // su horario de clases (es opcional).
                        codigoSeccionDeClase(registro)
                ));
            }
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public AcademicInfoResponse getAcademicInfo(Long userId) {
        Map<Long, Long> grades = getGrades(userId);
        List<CurrentCourseResponse> currentCourses = getCurrentCourses(userId);
        String currentSemester = semestreRepository.findByActivoTrue().map(Semestre::getSemestre).orElse(null);
        Usuario studentInfo = obtenerUsuario(userId);
        return new AcademicInfoResponse(grades, currentCourses, currentSemester, studentInfo);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SemesterHistoryEntry> getSemesterHistory(Long userId) {
        Map<Long, Curso> cache = new HashMap<>();
        Map<String, List<CourseHistoryEntry>> agrupado = new LinkedHashMap<>();

        for (MatriculaAlumno registro : matriculaRepository.findByIdAlumno(userId)) {
            String semestreNombre = registro.getSemestre().getSemestre();
            agrupado.computeIfAbsent(semestreNombre, k -> new ArrayList<>())
                    .add(construirCourseEntry(cache, registro));
        }

        Map<String, Boolean> suspendidoPorSemestre = new LinkedHashMap<>();
        for (AlumnoSemestre registro : alumnoSemestreRepository.findByIdAlumno(userId)) {
            suspendidoPorSemestre.put(registro.getSemestre().getSemestre(), Boolean.TRUE.equals(registro.getSuspendido()));
        }

        // Union: semestres con cursos matriculados + semestres solo registrados (p.ej. suspendidos, sin cursos)
        Set<String> todosLosSemestres = new LinkedHashSet<>(agrupado.keySet());
        todosLosSemestres.addAll(suspendidoPorSemestre.keySet());

        // Orden cronologico real (no el orden en que llegaron de la BD): un semestre
        // suspendido sin cursos solo existe en suspendidoPorSemestre, y sin este sort
        // siempre terminaba al final de la lista sin importar a que anio perteneciera.
        List<String> semestresOrdenados = new ArrayList<>(todosLosSemestres);
        semestresOrdenados.sort(Comparator.comparingInt(StudentServiceImpl::ordenSemestre));

        List<SemesterHistoryEntry> resultado = new ArrayList<>();
        for (String semestre : semestresOrdenados) {
            boolean suspendido = Boolean.TRUE.equals(suspendidoPorSemestre.get(semestre));
            List<CourseHistoryEntry> cursos = agrupado.getOrDefault(semestre, List.of());
            resultado.add(new SemesterHistoryEntry(semestre, suspendido, cursos));
        }
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getAvailableCoursesByCycle(Long cycle) {
        List<Curso> cursosDelCiclo = cursoServiceClient.getAllCourses().stream()
                .filter(c -> cycle.equals(c.getCycle()))
                .toList();

        List<Curso> obligatorios = cursosDelCiclo.stream().filter(c -> c.getSubcategoryId() == null).toList();

        Map<String, List<Curso>> electivos = new LinkedHashMap<>();
        cursosDelCiclo.stream().filter(c -> c.getSubcategoryId() != null).forEach(c ->
                electivos.computeIfAbsent(c.getSubcategoryName(), k -> new ArrayList<>()).add(c));

        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("obligatory", obligatorios);
        resultado.put("elective", electivos);
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getAvailableCoursesForSemester(Long userId, Long cycle) {
        List<Long> aprobados = matriculaRepository.findByIdAlumnoAndAprobadoTrue(userId).stream()
                .map(MatriculaAlumno::getIdCurso)
                .toList();

        // Cursos que el alumno aun no aprueba (ni oculta la administracion), sin importar el ciclo:
        // un alumno atrasado puede tener pendientes de ciclos anteriores, y debe poder verlos.
        List<Curso> pendientes = cursoServiceClient.getAllCourses().stream()
                .filter(c -> !aprobados.contains(c.getId()))
                .filter(c -> !Boolean.TRUE.equals(c.getIsHidden()))
                .toList();

        List<Curso> deCiclosAnteriores = pendientes.stream()
                .filter(c -> c.getCycle() != null && c.getCycle() < cycle)
                .toList();
        List<Curso> delCicloActual = pendientes.stream()
                .filter(c -> cycle.equals(c.getCycle()))
                .toList();
        List<Curso> otrosCursos = pendientes.stream()
                .filter(c -> c.getCycle() == null || c.getCycle() > cycle)
                .toList();

        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("cycle", cycle);
        resultado.put("previousCycleCourses", agruparCursos(deCiclosAnteriores));
        resultado.put("currentCycleCourses", agruparCursos(delCicloActual));
        resultado.put("otherCourses", agruparCursos(otrosCursos));
        return resultado;
    }

    // Cada bucket de cursos pendientes (de ciclos anteriores / del ciclo actual / el resto)
    // se agrupa igual: obligatorios sueltos + subcategorias (con su info de "requiere todos").
    private Map<String, Object> agruparCursos(List<Curso> cursos) {
        List<Curso> obligatorios = cursos.stream().filter(c -> c.getSubcategoryId() == null).toList();

        Map<Long, List<Curso>> agrupadoPorSubcategoria = new LinkedHashMap<>();
        cursos.stream().filter(c -> c.getSubcategoryId() != null).forEach(c ->
                agrupadoPorSubcategoria.computeIfAbsent(c.getSubcategoryId(), k -> new ArrayList<>()).add(c));

        List<Map<String, Object>> electiveSubcategories = new ArrayList<>();
        agrupadoPorSubcategoria.forEach((subcategoryId, cursosSub) -> {
            boolean requiresAll = Boolean.TRUE.equals(cursosSub.get(0).getSubcategoryRequiresAll());
            Integer requiredCourses = requiresAll
                    ? cursosSub.get(0).getSubcategoryTotalCourses()
                    : cursosSub.get(0).getSubcategoryRequiredCourses();

            Map<String, Object> grupo = new LinkedHashMap<>();
            grupo.put("id", subcategoryId);
            grupo.put("name", cursosSub.get(0).getSubcategoryName());
            grupo.put("requiredCourses", requiredCourses != null ? requiredCourses : 1);
            grupo.put("requiresAll", requiresAll);
            grupo.put("courses", cursosSub);
            electiveSubcategories.add(grupo);
        });

        Map<String, Object> resultado = new LinkedHashMap<>();
        resultado.put("obligatory", obligatorios);
        resultado.put("electiveSubcategories", electiveSubcategories);
        return resultado;
    }

    @Override
    @Transactional(readOnly = true)
    public ValidationResponse validatePrerequisites(Long userId, ValidatePrerequisitesRequest request) {
        Curso curso = cursoServiceClient.getCursoById(request.getCourseId());
        List<MatriculaAlumno> historial = matriculaRepository.findByIdAlumno(userId);
        List<Long> seleccionActual = request.getPreviousCourses() == null ? List.of() : request.getPreviousCourses();

        List<String> errores = new ArrayList<>();
        if (curso.getPrerequisites() != null) {
            for (Curso.Prerequisite prereq : curso.getPrerequisites()) {
                boolean cumplido = switch (prereq.getType()) {
                    case PrerequisiteTypes.APPROVED -> historial.stream().anyMatch(h ->
                            h.getIdCurso().equals(prereq.getSource()) && Boolean.TRUE.equals(h.getAprobado()));
                    case PrerequisiteTypes.MIN_GRADE -> historial.stream().anyMatch(h ->
                            h.getIdCurso().equals(prereq.getSource()) && h.getNotaFinal() != null
                                    && prereq.getMinGrade() != null && h.getNotaFinal() >= prereq.getMinGrade());
                    case PrerequisiteTypes.COREQUISITE -> seleccionActual.contains(prereq.getSource())
                            || historial.stream().anyMatch(h -> h.getIdCurso().equals(prereq.getSource())
                                    && Boolean.TRUE.equals(h.getAprobado()));
                    default -> true;
                };

                if (!cumplido) {
                    String nombrePrereq = obtenerNombreCurso(prereq.getSource());
                    errores.add("No cumples el prerrequisito de " + curso.getName() + ": " + nombrePrereq);
                }
            }
        }

        return new ValidationResponse(errores.isEmpty(), errores);
    }

    @Override
    @Transactional
    public SemesterHistoryEntry registerSemester(Long userId, RegisterSemesterRequest request) {
        if (request.getSemester() == null || request.getSemester().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "El campo semester es requerido.");
        }

        Semestre semestre = semestreRepository.findBySemestre(request.getSemester())
                .orElseGet(() -> {
                    Semestre nuevo = new Semestre();
                    nuevo.setSemestre(request.getSemester());
                    nuevo.setActivo(false);
                    return semestreRepository.save(nuevo);
                });

        AlumnoSemestre registro = alumnoSemestreRepository.findByIdAlumnoAndSemestre_Id(userId, semestre.getId())
                .orElseGet(() -> {
                    AlumnoSemestre nuevo = new AlumnoSemestre();
                    nuevo.setIdAlumno(userId);
                    nuevo.setSemestre(semestre);
                    return nuevo;
                });
        registro.setSuspendido(Boolean.TRUE.equals(request.getSuspended()));
        alumnoSemestreRepository.save(registro);

        if (request.getCourses() != null) {
            for (RegisterSemesterRequest.CourseSelection seleccion : request.getCourses()) {
                if (seleccion.getCourseId() == null) {
                    continue;
                }
                MatriculaAlumno matricula = matriculaRepository
                        .findByIdAlumnoAndIdCursoAndSemestre_Semestre(userId, seleccion.getCourseId(), semestre.getSemestre())
                        .orElseGet(() -> {
                            MatriculaAlumno nueva = new MatriculaAlumno();
                            nueva.setIdAlumno(userId);
                            nueva.setIdCurso(seleccion.getCourseId());
                            nueva.setSemestre(semestre);
                            return nueva;
                        });
                matricula.setNotaFinal(seleccion.getGrade());
                matricula.setTieneExcepcion(Boolean.TRUE.equals(seleccion.getException()));
                matricula.setAprobado(seleccion.getGrade() != null && seleccion.getGrade() >= 11);

                // Las secciones son opcionales: si el alumno no las manda, la
                // matricula queda "general" y aun asi puede comentar y calificar.
                aplicarSecciones(matricula, seleccion.getScheduleIds());

                matriculaRepository.save(matricula);
            }
        }

        return construirEntrada(userId, semestre.getSemestre(), Boolean.TRUE.equals(registro.getSuspendido()));
    }

    private SemesterHistoryEntry construirEntrada(Long userId, String semestreNombre, boolean suspendido) {
        Map<Long, Curso> cache = new HashMap<>();
        List<CourseHistoryEntry> cursos = matriculaRepository
                .findByIdAlumnoAndSemestre_Semestre(userId, semestreNombre).stream()
                .map(registro -> construirCourseEntry(cache, registro))
                .toList();
        return new SemesterHistoryEntry(semestreNombre, suspendido, new ArrayList<>(cursos));
    }

    private CourseHistoryEntry construirCourseEntry(Map<Long, Curso> cache, MatriculaAlumno registro) {
        Curso curso = obtenerCurso(cache, registro.getIdCurso());
        List<SeccionResumen> secciones = registro.getHorarios().stream()
                .map(MatriculaHorario::getHorario)
                .map(h -> new SeccionResumen(h.getId(), h.getTipo(), h.getHorario()))
                .toList();

        return new CourseHistoryEntry(
                registro.getIdCurso(),
                curso == null ? null : curso.getCode(),
                curso == null ? null : curso.getName(),
                curso == null ? null : curso.getCredits(),
                registro.getNotaFinal(),
                Boolean.TRUE.equals(registro.getTieneExcepcion()),
                curso != null && curso.getSubcategoryId() != null && !Boolean.TRUE.equals(curso.getSubcategoryRequiresAll()),
                curso == null ? null : curso.getSubcategoryId(),
                secciones
        );
    }

    /**
     * Reemplaza las secciones enlazadas a una matricula. Se ignoran las que no
     * pertenezcan al curso y semestre de la matricula, para que un id suelto
     * no pueda enganchar al alumno a la seccion de otro curso.
     */
    private void aplicarSecciones(MatriculaAlumno matricula, List<Long> scheduleIds) {
        if (scheduleIds == null) {
            return;
        }
        matricula.getHorarios().clear();
        for (Long idHorario : scheduleIds) {
            if (idHorario == null) {
                continue;
            }
            horarioRepository.findById(idHorario)
                    .filter(h -> h.getIdCurso().equals(matricula.getIdCurso()))
                    .filter(h -> h.getSemestre().getSemestre().equals(matricula.getSemestre().getSemestre()))
                    .ifPresent(h -> {
                        MatriculaHorario enlace = new MatriculaHorario();
                        enlace.setMatricula(matricula);
                        enlace.setHorario(h);
                        matricula.getHorarios().add(enlace);
                    });
        }
    }

    /** Codigo de la seccion de clases que el alumno registro, o null si no registro ninguna. */
    private String codigoSeccionDeClase(MatriculaAlumno matricula) {
        return matricula.getHorarios().stream()
                .map(MatriculaHorario::getHorario)
                .filter(h -> h.getTipo() == TipoHorario.CLASE)
                .map(Horario::getHorario)
                .findFirst()
                .orElse(null);
    }

    @Override
    public void completeRegistration(Long userId) {
        // No hay un estado de "matricula finalizada" en el modelo actual;
        // las matriculas ya quedan persistidas por registerSemester.
    }

    @Override
    @Transactional
    public void resetAcademicHistory(Long userId) {
        matriculaRepository.deleteByIdAlumno(userId);
        alumnoSemestreRepository.deleteByIdAlumno(userId);
    }

    // Orden cronologico de un semestre. El verano (-0) va enero-febrero, o sea
    // al INICIO del anio: 2024-0 -> 2024-1 -> 2024-2. Coincide con el orden
    // numerico natural del ciclo, asi que basta con anio*3 + ciclo.
    private static int ordenSemestre(String semestre) {
        String[] partes = semestre.split("-");
        int anio = Integer.parseInt(partes[0]);
        int ciclo = Integer.parseInt(partes[1]);
        return anio * 3 + ciclo;
    }

    private Curso obtenerCurso(Map<Long, Curso> cache, Long id) {
        if (id == null) {
            return null;
        }
        if (cache.containsKey(id)) {
            return cache.get(id);
        }
        try {
            Curso curso = cursoServiceClient.getCursoById(id);
            cache.put(id, curso);
            return curso;
        } catch (Exception e) {
            cache.put(id, null);
            return null;
        }
    }

    private Usuario obtenerUsuario(Long id) {
        try {
            return usuarioServiceClient.getUsuarioById(id);
        } catch (Exception e) {
            return null;
        }
    }

    private String obtenerNombreCurso(Long id) {
        try {
            return cursoServiceClient.getCursoById(id).getName();
        } catch (Exception e) {
            return "curso #" + id;
        }
    }
}
