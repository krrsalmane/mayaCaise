package command.CaiseMayaGroup.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseRequestDTO {

    @NotNull(message = "Client ID is required")
    private Long clientId;

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Discount is required")
    @Min(value = 0, message = "Discount must be at least 0%")
    @Max(value = 70, message = "Discount cannot exceed 70%")
    private Integer discountPercent;
}
