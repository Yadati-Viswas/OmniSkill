package org.omniquiz.codingproblems.service;

import com.opencsv.CSVReader;
import com.opencsv.CSVReaderBuilder;
import com.opencsv.exceptions.CsvException;
import org.omniquiz.codingproblems.model.Problem;
import org.omniquiz.codingproblems.repository.ProblemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStreamReader;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class CsvImporter implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(CsvImporter.class);

    @Autowired
    private final ProblemRepository repository;

    private final ResourceLoader resourceLoader;

    public CsvImporter(ProblemRepository repository, ResourceLoader resourceLoader) {
        this.repository = repository;
        this.resourceLoader = resourceLoader;
    }

    @Override
    public void run(String... args) throws Exception {
        if (repository.count() == 0) {
            logger.info("Problems table is empty. Starting CSV import...");
            importCsv();
            logger.info("CSV import completed.");
        } else {
            logger.info("Problems table already has data. Skipping import.");
        }
    }

    private void importCsv() throws IOException, CsvException {
        Resource csvResource = resourceLoader.getResource("classpath:questions_dataset.csv");
        try (CSVReader csvReader = new CSVReaderBuilder(new InputStreamReader(csvResource.getInputStream()))
                .withSkipLines(1)  // Skip header
                .build()) {

            List<String[]> rows = csvReader.readAll();
            for (String[] row : rows) {
                if (row.length < 9) continue;

                Problem problem = new Problem();
                try {
                    problem.setId(Long.parseLong(row[0].trim()));
                    problem.setTitle(row[1]);
                    problem.setDescription(row[2]);
                    problem.setDifficultyLevel(row[3]);

                    if (!row[4].isBlank()) {
                        problem.setCreatedAt(ZonedDateTime.parse(row[4]));
                    }
                    if (!row[5].isBlank()) {
                        problem.setUpdatedAt(ZonedDateTime.parse(row[5]));
                    }

                    problem.setExamples(row[6]);
                    problem.setConstraints(row[7]);
                    problem.setTestCases(row[8]);
                    problem.setTags(row[9]);

                    repository.save(problem);
                } catch (Exception e) {
                    logger.error("Failed to import row with id: " + row[0], e);
                }
            }
        }
    }
}