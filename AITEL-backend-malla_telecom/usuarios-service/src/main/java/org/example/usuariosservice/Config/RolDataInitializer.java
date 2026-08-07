package org.example.usuariosservice.Config;

import org.example.usuariosservice.Model.Entity.Rol;
import org.example.usuariosservice.Model.Roles;
import org.example.usuariosservice.Repository.RolRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class RolDataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;

    public RolDataInitializer(RolRepository rolRepository) {
        this.rolRepository = rolRepository;
    }

    @Override
    public void run(String... args) {
        if (rolRepository.count() == 0) {
            rolRepository.save(nuevoRol(Roles.ESTUDIANTE));
            rolRepository.save(nuevoRol(Roles.PROFESOR));
            rolRepository.save(nuevoRol(Roles.ADMIN));
        }
    }

    private Rol nuevoRol(String nombre) {
        Rol rol = new Rol();
        rol.setRol(nombre);
        return rol;
    }
}
