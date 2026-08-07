package org.example.semestresservice.Client;

import org.example.semestresservice.Model.Usuario;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "usuarios-service", url = "${usuarios-service.url}")
public interface UsuarioServiceClient {

    @GetMapping("/usuarios/{id}")
    Usuario getUsuarioById(@PathVariable("id") Long id);
}
