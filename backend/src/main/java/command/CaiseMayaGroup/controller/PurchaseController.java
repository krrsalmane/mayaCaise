package command.CaiseMayaGroup.controller;

import command.CaiseMayaGroup.dto.PurchasePaymentUpdateDTO;
import command.CaiseMayaGroup.dto.PurchaseRequestDTO;
import command.CaiseMayaGroup.dto.PurchaseResponseDTO;
import command.CaiseMayaGroup.service.PurchaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
@Tag(name = "Purchases", description = "Purchase / sales management APIs")
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    @Operation(summary = "Create a new purchase (sale)")
    public ResponseEntity<PurchaseResponseDTO> create(@Valid @RequestBody PurchaseRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(purchaseService.create(dto));
    }

    @GetMapping
    @Operation(summary = "List purchase history with pagination")
    public ResponseEntity<Page<PurchaseResponseDTO>> findAll(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(purchaseService.findAll(pageable));
    }

    @GetMapping("/client/{clientId}")
    @Operation(summary = "List purchases by client")
    public ResponseEntity<Page<PurchaseResponseDTO>> findByClient(
            @PathVariable Long clientId,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(purchaseService.findByClient(clientId, pageable));
    }

    @GetMapping("/date")
    @Operation(summary = "List purchases by date range")
    public ResponseEntity<Page<PurchaseResponseDTO>> findByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(purchaseService.findByDateRange(startDate, endDate, pageable));
    }

    @PatchMapping("/{id}/paid")
    @Operation(summary = "Update purchase payment status")
    public ResponseEntity<PurchaseResponseDTO> updatePaymentStatus(
            @PathVariable Long id,
            @Valid @RequestBody PurchasePaymentUpdateDTO dto) {
        return ResponseEntity.ok(purchaseService.updatePaymentStatus(id, dto));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get purchase by ID")
    public ResponseEntity<PurchaseResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.findById(id));
    }
}
