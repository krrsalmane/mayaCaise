package command.CaiseMayaGroup.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseResponseDTO {

    private Long id;
    private LocalDateTime purchaseDate;
    private BigDecimal unitPrice;
    private Integer discountPercent;
    private BigDecimal totalPrice;
    private Long clientId;
    private String clientName;
    private String clientType;
    private Long productId;
    private String productName;
    private Boolean paid;
}
