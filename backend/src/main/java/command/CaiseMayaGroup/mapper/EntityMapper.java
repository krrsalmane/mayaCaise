package command.CaiseMayaGroup.mapper;

import command.CaiseMayaGroup.dto.*;
import command.CaiseMayaGroup.entity.*;

public final class EntityMapper {

    private EntityMapper() {
    }

    public static CategoryResponseDTO toCategoryResponse(Category category) {
        return CategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .productCount(category.getProducts() != null ? category.getProducts().size() : 0)
                .build();
    }

    public static ProductResponseDTO toProductResponse(Product product) {
        return ProductResponseDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .imageUrl(product.getImageUrl())
                .categoryId(product.getCategory().getId())
                .categoryName(product.getCategory().getName())
                .build();
    }

    public static ClientResponseDTO toClientResponse(Client client) {
        return ClientResponseDTO.builder()
                .id(client.getId())
                .firstName(client.getFirstName())
                .lastName(client.getLastName())
                .phoneNumber(client.getPhoneNumber())
                .email(client.getEmail())
                .fullName(client.getFirstName() + " " + client.getLastName())
                .clientType(client.getClientType() != null ? client.getClientType().name() : null)
                .build();
    }

    public static PurchaseResponseDTO toPurchaseResponse(Purchase purchase) {
        return PurchaseResponseDTO.builder()
                .id(purchase.getId())
                .purchaseDate(purchase.getPurchaseDate())
                .unitPrice(purchase.getUnitPrice())
                .discountPercent(purchase.getDiscountPercent())
                .totalPrice(purchase.getTotalPrice())
                .clientId(purchase.getClient().getId())
                .clientName(purchase.getClient().getFirstName() + " " + purchase.getClient().getLastName())
                .clientType(purchase.getClient().getClientType() != null
                        ? purchase.getClient().getClientType().name() : null)
                .productId(purchase.getProduct().getId())
                .productName(purchase.getProduct().getName())
                .paid(Boolean.TRUE.equals(purchase.getPaid()))
                .build();
    }
}
