package command.CaiseMayaGroup.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchasePaymentUpdateDTO {

    @NotNull(message = "Paid status is required")
    private Boolean paid;
}
