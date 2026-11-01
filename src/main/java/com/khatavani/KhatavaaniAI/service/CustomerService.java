package com.khatavani.KhatavaaniAI.service;

import com.khatavani.KhatavaaniAI.dto.PaymentReceiveRequest;
import com.khatavani.KhatavaaniAI.entity.Customer;
import com.khatavani.KhatavaaniAI.entity.CustomerLedgerEntry;
import com.khatavani.KhatavaaniAI.entity.User;
import com.khatavani.KhatavaaniAI.repository.CustomerLedgerEntryRepository;
import com.khatavani.KhatavaaniAI.repository.CustomerRepository;
import com.khatavani.KhatavaaniAI.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerLedgerEntryRepository ledgerEntryRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Customer saveCustomer(Customer customer) {
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer receivePayment(PaymentReceiveRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        BigDecimal updatedDue = customer.getCurrentDue().subtract(request.getAmountPaid());
        if (updatedDue.compareTo(BigDecimal.ZERO) < 0) {
            updatedDue = BigDecimal.ZERO;
        }
        customer.setCurrentDue(updatedDue);
        customerRepository.save(customer);

        CustomerLedgerEntry ledgerEntry = CustomerLedgerEntry.builder()
                .customer(customer)
                .amountTaken(BigDecimal.ZERO)
                .amountPaid(request.getAmountPaid())
                .balance(updatedDue)
                .build();
        ledgerEntryRepository.save(ledgerEntry);

        return customer;
    }

    public List<CustomerLedgerEntry> getCustomerLedger(Long customerId) {
        return ledgerEntryRepository.findByCustomerIdOrderByTransactionDateDesc(customerId);
    }


    @Scheduled(cron = "0 0 9 * * *")
    public void sendOverdueReminders() {
        List<Customer> overdueCustomers = customerRepository.findOverdueCustomers(LocalDate.now());
        for (Customer c : overdueCustomers) {
            if (c.getEmail() != null && !c.getEmail().isBlank()) {
                emailService.sendUdhaarDueReminder(
                        c.getEmail(),
                        c.getName(),
                        c.getCurrentDue(),
                        c.getDueDate().toString()
                );
            }
        }
    }
}