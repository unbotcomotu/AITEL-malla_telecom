package org.example.comentariosservice.Model;

import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

/**
 * Utilidades para trabajar con nombres de semestre ("2025-1").
 *
 * El ciclo de verano es el "-0" y ocurre en enero-febrero, o sea al INICIO del
 * anio: 2025-0 va antes que 2025-1. Por eso el orden cronologico coincide con
 * el orden numerico y basta con anio*3 + ciclo.
 */
public final class Semestres {

    /** Valor usado cuando un comentario o voto no pertenece a un ciclo concreto. */
    public static final String GENERAL = "Todos";

    private Semestres() {
    }

    public static boolean esGeneral(String semestre) {
        return semestre == null || semestre.isBlank() || GENERAL.equals(semestre);
    }

    /** Clave de orden. Los valores no reconocidos van al final (Integer.MIN_VALUE). */
    public static int orden(String semestre) {
        if (esGeneral(semestre)) {
            return Integer.MIN_VALUE;
        }
        String[] partes = semestre.split("-");
        if (partes.length != 2) {
            return Integer.MIN_VALUE;
        }
        try {
            return Integer.parseInt(partes[0].trim()) * 3 + Integer.parseInt(partes[1].trim());
        } catch (NumberFormatException e) {
            return Integer.MIN_VALUE;
        }
    }

    /**
     * Los N semestres mas recientes dentro de los que se le pasen. Se excluye
     * el pseudo-ciclo "Todos": no es un semestre real y no deberia gastar un
     * cupo del filtro.
     */
    public static Set<String> ultimos(Collection<String> semestres, int n) {
        if (n <= 0) {
            return Set.of();
        }
        return semestres.stream()
                .filter(s -> !esGeneral(s))
                .distinct()
                .sorted(Comparator.comparingInt(Semestres::orden).reversed())
                .limit(n)
                .collect(LinkedHashSet::new, Set::add, Set::addAll);
    }

    public static List<String> ordenados(Collection<String> semestres) {
        return semestres.stream()
                .filter(s -> !esGeneral(s))
                .distinct()
                .sorted(Comparator.comparingInt(Semestres::orden))
                .toList();
    }
}
