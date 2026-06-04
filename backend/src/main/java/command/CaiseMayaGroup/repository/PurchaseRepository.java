package command.CaiseMayaGroup.repository;

import command.CaiseMayaGroup.dto.ProductSalesDTO;
import command.CaiseMayaGroup.entity.Purchase;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PurchaseRepository extends JpaRepository<Purchase, Long> {

    Page<Purchase> findByClientId(Long clientId, Pageable pageable);

    Page<Purchase> findByPurchaseDateBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    @Query("SELECT COALESCE(SUM(p.totalPrice), 0) FROM Purchase p")
    BigDecimal sumTotalSales();

    @Query("SELECT new command.CaiseMayaGroup.dto.ProductSalesDTO(" +
           "p.product.id, p.product.name, COUNT(p), SUM(p.totalPrice)) " +
           "FROM Purchase p GROUP BY p.product.id, p.product.name ORDER BY COUNT(p) DESC")
    List<ProductSalesDTO> findMostSoldProducts(Pageable pageable);

    @Query(value = """
            SELECT DATE(purchase_date) AS sale_date,
                   COUNT(*) AS purchase_count,
                   COALESCE(SUM(total_price), 0) AS total_amount
            FROM purchases
            GROUP BY DATE(purchase_date)
            ORDER BY DATE(purchase_date) DESC
            """, nativeQuery = true)
    List<Object[]> findSalesByDayRaw(Pageable pageable);
}
