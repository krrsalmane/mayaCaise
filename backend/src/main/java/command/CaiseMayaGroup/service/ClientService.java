package command.CaiseMayaGroup.service;

import command.CaiseMayaGroup.dto.ClientRequestDTO;
import command.CaiseMayaGroup.dto.ClientResponseDTO;
import command.CaiseMayaGroup.entity.Client;
import command.CaiseMayaGroup.exception.BusinessException;
import command.CaiseMayaGroup.exception.ResourceNotFoundException;
import command.CaiseMayaGroup.mapper.EntityMapper;
import command.CaiseMayaGroup.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ClientService {

    private final ClientRepository clientRepository;

    public ClientResponseDTO create(ClientRequestDTO dto) {
        validateUniqueFields(null, dto);
        Client client = Client.builder()
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .phoneNumber(dto.getPhoneNumber())
                .email(dto.getEmail())
                .clientType(dto.getClientType())
                .build();
        return EntityMapper.toClientResponse(clientRepository.save(client));
    }

    public ClientResponseDTO update(Long id, ClientRequestDTO dto) {
        Client client = findEntityById(id);
        validateUniqueFields(id, dto);
        client.setFirstName(dto.getFirstName());
        client.setLastName(dto.getLastName());
        client.setPhoneNumber(dto.getPhoneNumber());
        client.setEmail(dto.getEmail());
        client.setClientType(dto.getClientType());
        return EntityMapper.toClientResponse(clientRepository.save(client));
    }

    public void delete(Long id) {
        Client client = findEntityById(id);
        clientRepository.delete(client);
    }

    @Transactional(readOnly = true)
    public Page<ClientResponseDTO> findAll(Pageable pageable) {
        return clientRepository.findAll(pageable).map(EntityMapper::toClientResponse);
    }

    @Transactional(readOnly = true)
    public Page<ClientResponseDTO> searchByName(String name, Pageable pageable) {
        return clientRepository.searchByName(name, pageable).map(EntityMapper::toClientResponse);
    }

    @Transactional(readOnly = true)
    public ClientResponseDTO findById(Long id) {
        return EntityMapper.toClientResponse(findEntityById(id));
    }

    @Transactional(readOnly = true)
    public Client findEntityById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client not found with id: " + id));
    }

    private void validateUniqueFields(Long id, ClientRequestDTO dto) {
        clientRepository.findAll().stream()
                .filter(c -> id == null || !c.getId().equals(id))
                .forEach(c -> {
                    if (c.getPhoneNumber().equals(dto.getPhoneNumber())) {
                        throw new BusinessException("Phone number already in use");
                    }
                    if (dto.getEmail() != null && dto.getEmail().equals(c.getEmail())) {
                        throw new BusinessException("Email already in use");
                    }
                });
    }
}
