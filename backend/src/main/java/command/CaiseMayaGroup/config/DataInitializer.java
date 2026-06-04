package command.CaiseMayaGroup.config;

import command.CaiseMayaGroup.entity.*;
import command.CaiseMayaGroup.repository.CategoryRepository;
import command.CaiseMayaGroup.repository.ClientRepository;
import command.CaiseMayaGroup.repository.ProductRepository;
import command.CaiseMayaGroup.repository.PurchaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ClientRepository clientRepository;
    private final PurchaseRepository purchaseRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            return;
        }

        Category hotDrinks = categoryRepository.save(Category.builder()
                .name("Hot Drinks")
                .description("Warm beverages including coffee and tea")
                .build());

        Category coldDrinks = categoryRepository.save(Category.builder()
                .name("Cold Drinks")
                .description("Refreshing cold beverages")
                .build());

        Category desserts = categoryRepository.save(Category.builder()
                .name("Desserts")
                .description("Sweet treats and pastries")
                .build());

        Category snacks = categoryRepository.save(Category.builder()
                .name("Snacks")
                .description("Light snacks and bites")
                .build());

        Product espresso = productRepository.save(Product.builder()
                .name("Espresso")
                .description("Strong Italian coffee")
                .price(new BigDecimal("2.50"))
                .stock(100)
                .category(hotDrinks)
                .build());

        Product cappuccino = productRepository.save(Product.builder()
                .name("Cappuccino")
                .description("Espresso with steamed milk foam")
                .price(new BigDecimal("3.50"))
                .stock(80)
                .category(hotDrinks)
                .build());

        Product latte = productRepository.save(Product.builder()
                .name("Latte")
                .description("Espresso with steamed milk")
                .price(new BigDecimal("3.80"))
                .stock(75)
                .category(hotDrinks)
                .build());

        productRepository.save(Product.builder()
                .name("Coca Cola")
                .description("Classic cola drink")
                .price(new BigDecimal("2.00"))
                .stock(120)
                .category(coldDrinks)
                .build());

        productRepository.save(Product.builder()
                .name("Orange Juice")
                .description("Fresh squeezed orange juice")
                .price(new BigDecimal("3.00"))
                .stock(60)
                .category(coldDrinks)
                .build());

        productRepository.save(Product.builder()
                .name("Croissant")
                .description("Buttery French pastry")
                .price(new BigDecimal("2.80"))
                .stock(40)
                .category(desserts)
                .build());

        productRepository.save(Product.builder()
                .name("Sandwich")
                .description("Club sandwich with ham and cheese")
                .price(new BigDecimal("5.50"))
                .stock(30)
                .category(snacks)
                .build());

        Client client1 = clientRepository.save(Client.builder()
                .firstName("Ahmed")
                .lastName("Benali")
                .phoneNumber("0612345678")
                .email("ahmed.benali@email.com")
                .clientType(ClientType.STAFF)
                .build());

        Client client2 = clientRepository.save(Client.builder()
                .firstName("Fatima")
                .lastName("Zahra")
                .phoneNumber("0698765432")
                .email("fatima.zahra@email.com")
                .clientType(ClientType.EXTERNE)
                .build());

        purchaseRepository.save(Purchase.builder()
                .purchaseDate(LocalDateTime.now().minusDays(2))
                .unitPrice(espresso.getPrice())
                .discountPercent(10)
                .totalPrice(new BigDecimal("2.25"))
                .paid(false)
                .client(client1)
                .product(espresso)
                .build());

        purchaseRepository.save(Purchase.builder()
                .purchaseDate(LocalDateTime.now().minusDays(1))
                .unitPrice(cappuccino.getPrice())
                .discountPercent(0)
                .totalPrice(cappuccino.getPrice())
                .paid(true)
                .client(client2)
                .product(cappuccino)
                .build());

        purchaseRepository.save(Purchase.builder()
                .purchaseDate(LocalDateTime.now())
                .unitPrice(latte.getPrice())
                .discountPercent(5)
                .totalPrice(new BigDecimal("3.61"))
                .paid(false)
                .client(client1)
                .product(latte)
                .build());

        espresso.setStock(espresso.getStock() - 1);
        cappuccino.setStock(cappuccino.getStock() - 1);
        latte.setStock(latte.getStock() - 1);
        productRepository.save(espresso);
        productRepository.save(cappuccino);
        productRepository.save(latte);
    }
}
