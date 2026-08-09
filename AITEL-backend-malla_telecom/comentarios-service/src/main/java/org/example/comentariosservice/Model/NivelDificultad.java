package org.example.comentariosservice.Model;

/**
 * Tramo en el que cae el promedio de dificultad de un curso. El front usa la
 * clave para elegir que carita mostrar, y la etiqueta para el texto.
 *
 * Los limites son cerrados por abajo y abiertos por arriba (un promedio de 3.0
 * ya cuenta como dificil), salvo el ultimo tramo que llega hasta el 5.
 */
public enum NivelDificultad {
    EASY("Fácil"),
    MEDIUM("Medio"),
    HARD("Difícil"),
    VERY_HARD("Muy difícil");

    private final String etiqueta;

    NivelDificultad(String etiqueta) {
        this.etiqueta = etiqueta;
    }

    public String getEtiqueta() {
        return etiqueta;
    }

    /** Devuelve null si todavia no hay votos (promedio 0 o menor). */
    public static NivelDificultad desdePromedio(double promedio) {
        if (promedio <= 0) {
            return null;
        }
        if (promedio < 2) {
            return EASY;
        }
        if (promedio < 3) {
            return MEDIUM;
        }
        if (promedio < 4) {
            return HARD;
        }
        return VERY_HARD;
    }
}
