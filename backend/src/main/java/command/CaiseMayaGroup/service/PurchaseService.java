package command.CaiseMayaGroup.service;

import command.CaiseMayaGroup.dto.PurchasePaymentUpdateDTO;
import command.CaiseMayaGroup.dto.PurchaseRequestDTO;
import command.CaiseMayaGroup.dto.PurchaseResponseDTO;
import command.CaiseMayaGroup.entity.Client;
import command.CaiseMayaGroup.entity.Product;
import command.CaiseMayaGroup.entity.Purchase;
import command.CaiseMayaGroup.exception.BusinessException;
import command.CaiseMayaGroup.exception.InsufficientStockException;
import command.CaiseMayaGroup.exception.ResourceNotFoundException;
import command.CaiseMayaGroup.mapper.EntityMapper;
import command.CaiseMayaGroup.repository.PurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@Transactional
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final ClientService clientService;
    private final ProductService productService;

    public PurchaseResponseDTO create(PurchaseRequestDTO dto) {
        validateDiscount(dto.getDiscountPercent());

        Client client = clientService.findEntityById(dto.getClientId());
        Product product = productService.findEntityById(dto.getProductId());

        if (product.getStock() < 1) {
            throw new InsufficientStockException(
                    "Insufficient stock for product '" + product.getName() + "'. Available: " + product.getStock());
        }

        BigDecimal unitPrice = product.getPrice();
        BigDecimal totalPrice = calculateTotal(unitPrice, dto.getDiscountPercent());

        Purchase purchase = Purchase.builder()
                .purchaseDate(LocalDateTime.now())
                .unitPrice(unitPrice)
                .discountPercent(dto.getDiscountPercent())
                .totalPrice(totalPrice)
                .paid(false)
                .client(client)
                .product(product)
                .build();

        product.setStock(product.getStock() - 1);

        return EntityMapper.toPurchaseResponse(purchaseRepository.save(purchase));
    }

    @Transactional(readOnly = true)
    public Page<PurchaseResponseDTO> findAll(Pageable pageable) {
        return purchaseRepository.findAll(pageable).map(EntityMapper::toPurchaseResponse);
    }

    @Transactional(readOnly = true)
    public Page<PurchaseResponseDTO> findByClient(Long clientId, Pageable pageable) {
        clientService.findEntityById(clientId);
        return purchaseRepository.findByClientId(clientId, pageable).map(EntityMapper::toPurchaseResponse);
    }

    @Transactional(readOnly = true)
    public Page<PurchaseResponseDTO> findByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        return purchaseRepository.findByPurchaseDateBetween(start, end, pageable)
                .map(EntityMapper::toPurchaseResponse);
    }

    public PurchaseResponseDTO updatePaymentStatus(Long id, PurchasePaymentUpdateDTO dto) {
        Purchase purchase = findEntityById(id);
        purchase.setPaid(dto.getPaid());
        return EntityMapper.toPurchaseResponse(purchaseRepository.save(purchase));
    }

    @Transactional(readOnly = true)
    public PurchaseResponseDTO findById(Long id) {
        return EntityMapper.toPurchaseResponse(findEntityById(id));
    }

    @Transactional(readOnly = true)
    public Purchase findEntityById(Long id) {
        return purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
    }

    private void validateDiscount(int discountPercent) {
        if (discountPercent == 0) {
            return;
        }
        if (discountPercent < 5 || discountPercent > 70) {
            throw new BusinessException("Discount must be 0% (no discount) or between 5% and 70%");
        }
    }

    private BigDecimal calculateTotal(BigDecimal unitPrice, int discountPercent) {
        if (discountPercent == 0) {
            return unitPrice.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal multiplier = BigDecimal.ONE.subtract(
                BigDecimal.valueOf(discountPercent).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
        return unitPrice.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
    }
}
