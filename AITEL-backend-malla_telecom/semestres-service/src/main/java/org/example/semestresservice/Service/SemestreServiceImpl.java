package org.example.semestresservice.Service;

import org.example.semestresservice.Dto.SemestreResponse;
import org.example.semestresservice.Exception.ApiException;
import org.example.semestresservice.Model.Entity.Semestre;
import org.example.semestresservice.Repository.SemestreRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class SemestreServiceImpl implements SemestreService {

    private final SemestreRepository semestreRepository;

    public SemestreServiceImpl(SemestreRepository semestreRepository) {
        this.semestreRepository = semestreRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SemestreResponse> getAll() {
        return semestreRepository.findAll().stream()
                .map(SemestreResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public SemestreResponse create(String nombre) {
        Semestre semestre = semestreRepository.findBySemestre(nombre).orElseGet(() -> {
            Semestre nuevo = new Semestre();
            nuevo.setSemestre(nombre);
            nuevo.setActivo(false);
            return semestreRepository.save(nuevo);
        });
        return SemestreResponse.from(semestre);
    }

    @Override
    @Transactional
    public SemestreResponse activate(Long id) {
        Semestre semestre = semestreRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Semestre no encontrado."));

        semestreRepository.findByActivoTrue().ifPresent(actual -> {
            actual.setActivo(false);
            semestreRepository.save(actual);
        });

        semestre.setActivo(true);
        return SemestreResponse.from(semestreRepository.save(semestre));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SemestreResponse> getActivo() {
        return semestreRepository.findByActivoTrue().map(SemestreResponse::from);
    }
}
