package com.khatavani.KhatavaaniAI.repository;

import com.khatavani.KhatavaaniAI.entity.Report;
import com.khatavani.KhatavaaniAI.model.enums.ReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    Optional<Report> findByReportTypeAndReportDate(ReportType reportType, LocalDate reportDate);
}
