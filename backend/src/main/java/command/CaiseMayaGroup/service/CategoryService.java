package command.CaiseMayaGroup.service;

import command.CaiseMayaGroup.dto.CategoryRequestDTO;
import command.CaiseMayaGroup.dto.CategoryResponseDTO;
import command.CaiseMayaGroup.entity.Category;
import command.CaiseMayaGroup.exception.BusinessException;
import command.CaiseMayaGroup.exception.ResourceNotFoundException;
import command.CaiseMayaGroup.mapper.EntityMapper;
import command.CaiseMayaGroup.repository.CategoryRepository;
import command.CaiseMayaGroup.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryResponseDTO create(CategoryRequestDTO dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new BusinessException("Category with name '" + dto.getName() + "' already exists");
        }
        Category category = Category.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
        return EntityMapper.toCategoryResponse(categoryRepository.save(category));
    }

    public CategoryResponseDTO update(Long id, CategoryRequestDTO dto) {
        Category category = findEntityById(id);
        if (!category.getName().equals(dto.getName()) && categoryRepository.existsByName(dto.getName())) {
            throw new BusinessException("Category with name '" + dto.getName() + "' already exists");
        }
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        return EntityMapper.toCategoryResponse(categoryRepository.save(category));
    }

    public void delete(Long id) {
        Category category = findEntityById(id);
        if (productRepository.findByCategoryId(id, org.springframework.data.domain.Pageable.unpaged()).hasContent()) {
            throw new BusinessException("Cannot delete category with associated products");
        }
        categoryRepository.delete(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> findAll() {
        return categoryRepository.findAll().stream()
                .map(EntityMapper::toCategoryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponseDTO findById(Long id) {
        return EntityMapper.toCategoryResponse(findEntityById(id));
    }

    @Transactional(readOnly = true)
    public Category findEntityById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
    }
}
