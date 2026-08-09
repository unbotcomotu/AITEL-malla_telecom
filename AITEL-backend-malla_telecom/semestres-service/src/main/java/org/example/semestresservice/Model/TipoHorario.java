package org.example.semestresservice.Model;

/**
 * Tipo de seccion de un curso. Los codigos de origen de la universidad se
 * agrupan aqui: "Cla" -> CLASE, "Pra" y "Dir" -> PRACTICA, "Exa" -> EXAMEN.
 * Practica y dirigida se fusionan a proposito: para el alumno son el mismo
 * tipo de sesion y no vale la pena distinguirlas en la interfaz.
 */
public enum TipoHorario {
    CLASE,
    PRACTICA,
    EXAMEN;

    public static TipoHorario desdeCodigo(String codigo) {
        if (codigo == null) {
            return CLASE;
        }
        return switch (codigo.trim().toUpperCase()) {
            case "PRA", "DIR", "LAB", "PRACTICA" -> PRACTICA;
            case "EXA", "EXAMEN" -> EXAMEN;
            default -> CLASE;
        };
    }

    public String getEtiqueta() {
        return switch (this) {
            case CLASE -> "Clases";
            case PRACTICA -> "Laboratorios / Prácticas";
            case EXAMEN -> "Exámenes";
        };
    }
}
