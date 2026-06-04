package command.CaiseMayaGroup.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {

    private long totalProducts;
    private long totalClients;
    private long totalPurchases;
    private BigDecimal totalSalesAmount;
    private List<ProductSalesDTO> mostSoldProducts;
    private List<DailySalesDTO> salesByDay;
}
