-- ---------------------------------------------------------------------------
-- Migracion: la nota del alumno deja de colgar de un horario concreto.
--
-- Antes: `alumnos_por_horario` (alumno + horario + nota). Para poder registrar
-- historial antiguo el backend inventaba una seccion ficticia "HIST", o peor,
-- enganchaba al alumno a la primera seccion real que encontrara, atribuyendole
-- un horario que quizas nunca llevo.
--
-- Ahora: `matricula_alumno` (alumno + curso + semestre + nota) y, encima y de
-- forma opcional, `matricula_horario` con las secciones que el alumno si
-- recuerda haber llevado.
--
-- Ejecutar UNA VEZ, despues de desplegar el codigo nuevo (Hibernate crea las
-- tablas vacias al arrancar con ddl-auto=update).
--
-- La tabla vieja NO se toca: queda como respaldo. Ver el final del script para
-- el borrado, que conviene hacer recien cuando hayas verificado el historial.
-- ---------------------------------------------------------------------------

USE semestres_service_db;

START TRANSACTION;

-- 1. Pasar cada matricula a (alumno, curso, semestre).
--    Si por lo que sea hubiera mas de una fila para el mismo trio, se conserva
--    la mejor nota: es la interpretacion sensata de un curso repetido.
INSERT INTO matricula_alumno (id_alumno, id_curso, id_semestre, nota_final, tiene_excepcion, aprobado)
SELECT
    aph.id_alumno,
    h.id_curso,
    h.id_semestre,
    MAX(aph.nota_final)                        AS nota_final,
    MAX(aph.tiene_excepcion)                   AS tiene_excepcion,
    MAX(aph.aprobado)                          AS aprobado
FROM alumnos_por_horario aph
JOIN horario h ON h.id = aph.id_horario
GROUP BY aph.id_alumno, h.id_curso, h.id_semestre;

-- 2. Conservar el enlace a la seccion SOLO cuando era una seccion de verdad.
--    Las "HIST" eran un relleno del sistema, no algo que el alumno eligiera:
--    esas matriculas quedan como generales, que es justo lo que se busca.
INSERT INTO matricula_horario (id_matricula, id_horario)
SELECT DISTINCT
    m.id,
    aph.id_horario
FROM alumnos_por_horario aph
JOIN horario h ON h.id = aph.id_horario
JOIN matricula_alumno m
      ON  m.id_alumno   = aph.id_alumno
      AND m.id_curso    = h.id_curso
      AND m.id_semestre = h.id_semestre
WHERE h.horario <> 'HIST';

COMMIT;

-- ---------------------------------------------------------------------------
-- Verificacion. Los dos primeros conteos deben coincidir; si no, revisar antes
-- de seguir. El tercero lista las secciones ficticias que quedaron huerfanas.
-- ---------------------------------------------------------------------------

SELECT 'matriculas migradas' AS control, COUNT(*) AS total FROM matricula_alumno
UNION ALL
SELECT 'origen (curso+semestre distintos)', COUNT(*) FROM (
    SELECT 1
    FROM alumnos_por_horario aph
    JOIN horario h ON h.id = aph.id_horario
    GROUP BY aph.id_alumno, h.id_curso, h.id_semestre
) AS origen
UNION ALL
SELECT 'enlaces a secciones reales', COUNT(*) FROM matricula_horario
UNION ALL
SELECT 'secciones ficticias HIST', COUNT(*) FROM horario WHERE horario = 'HIST';

-- ---------------------------------------------------------------------------
-- LIMPIEZA (ejecutar aparte, solo tras confirmar que el historial se ve bien
-- en la aplicacion). Borra las secciones ficticias y la tabla vieja.
-- ---------------------------------------------------------------------------
-- DELETE FROM alumnos_por_horario
--  WHERE id_horario IN (SELECT id FROM horario WHERE horario = 'HIST');
-- DELETE FROM horario WHERE horario = 'HIST';
-- DROP TABLE alumnos_por_horario;
