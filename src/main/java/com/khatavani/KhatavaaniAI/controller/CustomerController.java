package com.khatavani.KhatavaaniAI.controller;

import com.khatavani.KhatavaaniAI.dto.PaymentReceiveRequest;
import com.khatavani.KhatavaaniAI.entity.Customer;
import com.khatavani.KhatavaaniAI.entity.CustomerLedgerEntry;
import com.khatavani.KhatavaaniAI.service.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

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

    // CustomerController.java ke andar ye method add karein:

    @PostMapping("/trigger-overdue-reminders")
    @PreAuthorize("hasAnyAuthority('ROLE_SHOPKEEPER', 'ROLE_ADMIN')")
    public ResponseEntity<String> triggerOverdueReminders() {
        customerService.sendOverdueReminders();
        return ResponseEntity.ok("Overdue reminder process executed successfully!");
    }
}