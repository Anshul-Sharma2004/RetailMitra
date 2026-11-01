package com.khatavani.KhatavaaniAI.controller;

import com.khatavani.KhatavaaniAI.dto.PaymentReceiveRequest;
import com.khatavani.KhatavaaniAI.entity.Customer;
import com.khatavani.KhatavaaniAI.entity.CustomerLedgerEntry;
import com.khatavani.KhatavaaniAI.repository.CustomerRepository;
import com.khatavani.KhatavaaniAI.service.CustomerService;
import com.khatavani.KhatavaaniAI.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;
    private final CustomerRepository customerRepository; // <-- Ee line add chesamu, red error poyindhi
    private final EmailService emailService;

    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_SHOPKEEPER', 'ROLE_ADMIN')")
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }



    @PostMapping("/add")
    @PreAuthorize("hasAnyAuthority('ROLE_SHOPKEEPER', 'ROLE_ADMIN')")
    public ResponseEntity<Customer> addCustomer(@RequestBody Customer customer) {
        return new ResponseEntity<>(customerService.saveCustomer(customer), HttpStatus.CREATED);
    }

    @PostMapping("/receive-payment")
    @PreAuthorize("hasAnyAuthority('ROLE_SHOPKEEPER', 'ROLE_ADMIN')")
    public ResponseEntity<Customer> receivePayment(@RequestBody PaymentReceiveRequest request) {
        return ResponseEntity.ok(customerService.receivePayment(request));
    }

    @GetMapping("/{id}/ledger")
    @PreAuthorize("hasAnyAuthority('ROLE_SHOPKEEPER', 'ROLE_ADMIN')")
    public List<CustomerLedgerEntry> getLedger(@PathVariable Long id) {
        return customerService.getCustomerLedger(id);
    }

    @PostMapping("/trigger-overdue-reminders")
    @PreAuthorize("hasAnyAuthority('ROLE_SHOPKEEPER', 'ROLE_ADMIN')")
    public ResponseEntity<String> triggerOverdueReminders() {
        customerService.sendOverdueReminders();
        return ResponseEntity.ok("Overdue reminder process executed successfully!");
    }

    @PostMapping("/{id}/send-reminder")
    @PreAuthorize("hasAnyAuthority('ROLE_SHOPKEEPER', 'ROLE_ADMIN')")
    public ResponseEntity<String> sendInstantReminder(@PathVariable Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));

        if (customer.getEmail() == null || customer.getEmail().isBlank()) {
            return ResponseEntity.badRequest().body("Customer email database lo register avaledhu!");
        }

        if (customer.getCurrentDue() == null || customer.getCurrentDue().compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.badRequest().body("Customer ki udhaar dues levu!");
        }

        emailService.sendUdhaarDueReminder(
                customer.getEmail(),
                customer.getName(),
                customer.getCurrentDue(),
                customer.getDueDate() != null ? customer.getDueDate().toString() : "N/A"
        );

        return ResponseEntity.ok("Payment reminder email customer ki pampadam jarigindi: " + customer.getEmail());
    }
}