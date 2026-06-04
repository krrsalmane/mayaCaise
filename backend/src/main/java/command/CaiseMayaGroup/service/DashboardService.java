package command.CaiseMayaGroup.service;

import command.CaiseMayaGroup.dto.DailySalesDTO;
import command.CaiseMayaGroup.dto.DashboardStatsDTO;
import command.CaiseMayaGroup.repository.ClientRepository;
import command.CaiseMayaGroup.repository.ProductRepository;
import command.CaiseMayaGroup.repository.PurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final ProductRepository productRepository;
    private final ClientRepository clientRepository;
    private final PurchaseRepository purchaseRepository;

    public DashboardStatsDTO getStats() {
        BigDecimal totalSales = purchaseRepository.sumTotalSales();
        if (totalSales == null) {
            totalSales = BigDecimal.ZERO;
        }

        return DashboardStatsDTO.builder()
                .totalProducts(productRepository.count())
                .totalClients(clientRepository.count())
                .totalPurchases(purchaseRepository.count())
                .totalSalesAmount(totalSales)
                .mostSoldProducts(purchaseRepository.findMostSoldProducts(PageRequest.of(0, 5)))
                .salesByDay(mapSalesByDay(purchaseRepository.findSalesByDayRaw(PageRequest.of(0, 30))))
                .build();
    }

    private List<DailySalesDTO> mapSalesByDay(List<Object[]> rows) {
        return rows.stream().map(row -> DailySalesDTO.builder()
                .date(toLocalDate(row[0]))
                .purchaseCount(((Number) row[1]).longValue())
                .totalAmount(row[2] instanceof BigDecimal bd ? bd : new BigDecimal(row[2].toString()))
                .build()).toList();
    }

    private LocalDate toLocalDate(Object value) {
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        if (value instanceof Date sqlDate) {
            return sqlDate.toLocalDate();
        }
        if (value instanceof java.util.Date utilDate) {
            return new Date(utilDate.getTime()).toLocalDate();
        }
        return LocalDate.parse(value.toString());
    }
}
