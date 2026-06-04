package command.CaiseMayaGroup.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailySalesDTO {

    private LocalDate date;
    private Long purchaseCount;
    private BigDecimal totalAmount;
}
