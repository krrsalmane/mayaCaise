package command.CaiseMayaGroup.service;

import command.CaiseMayaGroup.dto.ProductRequestDTO;
import command.CaiseMayaGroup.dto.ProductResponseDTO;
import command.CaiseMayaGroup.entity.Category;
import command.CaiseMayaGroup.entity.Product;
import command.CaiseMayaGroup.exception.ResourceNotFoundException;
import command.CaiseMayaGroup.mapper.EntityMapper;
import command.CaiseMayaGroup.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;

    public ProductResponseDTO create(ProductRequestDTO dto) {
        Category category = categoryService.findEntityById(dto.getCategoryId());
        Product product = Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .stock(dto.getStock())
                .imageUrl(dto.getImageUrl())
                .category(category)
                .build();
        return EntityMapper.toProductResponse(productRepository.save(product));
    }

    public ProductResponseDTO update(Long id, ProductRequestDTO dto) {
        Product product = findEntityById(id);
        Category category = categoryService.findEntityById(dto.getCategoryId());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setImageUrl(dto.getImageUrl());
        product.setCategory(category);
        return EntityMapper.toProductResponse(productRepository.save(product));
    }

    public void delete(Long id) {
        Product product = findEntityById(id);
        productRepository.delete(product);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> findAll(Pageable pageable) {
        return productRepository.findAll(pageable).map(EntityMapper::toProductResponse);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponseDTO> findByCategory(Long categoryId, Pageable pageable) {
        categoryService.findEntityById(categoryId);
        return productRepository.findByCategoryId(categoryId, pageable).map(EntityMapper::toProductResponse);
    }

    @Transactional(readOnly = true)
    public ProductResponseDTO findById(Long id) {
        return EntityMapper.toProductResponse(findEntityById(id));
    }

    @Transactional(readOnly = true)
    public Product findEntityById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }
}
