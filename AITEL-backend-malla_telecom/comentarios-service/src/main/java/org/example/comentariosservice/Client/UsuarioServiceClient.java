package org.example.comentariosservice.Client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "usuarios-service", url = "${usuarios-service.url}")
public interface UsuarioServiceClient {

    @GetMapping("/usuarios/{id}")
    UsuarioDto getUsuarioById(@PathVariable("id") Long id);

    class UsuarioDto {
        private Long id;
        private String email;
        private String fullName;

        public Long getId() {
            return id;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }
    }
}
