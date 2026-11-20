<!-- Sync Impact Report
Version change: unratified scaffold → 1.0.0
Modified principles: scaffold placeholders replaced by the eight approved Online Bookstore principles.
Added sections: populated Additional Constraints, Development Workflow, and Governance.
Removed sections: none.
Follow-up TODOs: none.
-->
# Online Bookstore Constitution

## Core Principles

### I. Database Integrity First
The database MUST enforce data correctness through appropriate primary keys, foreign keys, unique constraints, check constraints, and transactions. Application validation complements but MUST NOT replace database constraints. Integrity failures MUST be handled without leaving partial or inconsistent state.

### II. Testable Acceptance Criteria
Every feature specification MUST define observable, testable acceptance criteria before implementation. Each criterion MUST be verifiable through tests or a clearly described database query or other reproducible check. Implementation and review MUST trace results back to those criteria.

### III. Normalized Relational Schemas (3NF)
Relational schemas MUST be designed to meet Third Normal Form (3NF), avoiding repeating groups and unnecessary duplication or dependency anomalies. Any deliberate denormalization MUST be documented with its reason and consistency safeguards.

### IV. Parameterized SQL Only
All SQL statements containing data values MUST use parameterized queries or prepared statements. Constructing SQL by concatenating or interpolating untrusted or variable values is prohibited. Schema identifiers that cannot be parameterized MUST come from fixed, trusted allowlists.

### V. Atomic, Idempotent Purchases
A purchase MUST be processed atomically: order creation, inventory changes, and related records either all succeed or all roll back. Inventory MUST NOT be oversold, including under concurrent purchases. Retries or repeated requests MUST NOT create duplicate orders; the implementation MUST enforce an appropriate idempotency or uniqueness rule.

### VI. Evidence-Based Acceptance of AI-Generated Code
AI-generated code is not accepted on inspection or plausibility alone. Before acceptance, the relevant real tests MUST be executed against the actual implementation and their results recorded. Tests MUST cover applicable acceptance criteria; claimed or simulated test output is not evidence.

### VII. Specifications Are Living Documents
Specifications are the approved source of feature requirements and MUST be kept current. Every requirement change MUST be recorded with a unique change reference, its rationale, and the resulting specification update. When implementation or testing reveals a missing or conflicting requirement, work MUST pause until the change is proposed and approved.

### VIII. No Real Payment Information
Real payment card numbers, security codes, bank credentials, or other real payment information MUST NOT be entered, stored, logged, transmitted, or committed in project code, tests, or data. Payment-related development and testing MUST use synthetic data only; the system MUST NOT perform real payment processing unless separately authorized and governed.

## Additional Constraints

- Database constraints and transaction behavior are required safeguards, not optional optimizations.
- Test fixtures and examples involving customers or payments MUST be synthetic and non-sensitive.
- Secrets and credentials MUST NOT be committed or printed in logs or test output.

## Development Workflow

1. Define or update the feature specification and obtain student approval before implementation.
2. Ensure each feature has testable acceptance criteria and identify relevant integrity, security, and transaction cases.
3. Plan and implement only the approved scope.
4. Run real tests against the implementation, including database-level tests where relevant; record commands and actual results.
5. Compare test evidence with every acceptance criterion. Do not claim completion for unmet or unverified criteria.
6. If testing reveals an absent or ambiguous requirement, stop and propose a recorded specification change before continuing.
7. Review changes for 3NF, parameterized SQL, atomic purchase behavior, duplicate prevention, and absence of real payment data.

## Governance

This constitution governs project specifications, implementation, testing, and review. Feature specifications and plans MUST comply with it; any conflict MUST be resolved before implementation proceeds.

Amendments MUST be proposed with their rationale and impact, reviewed and approved by the student, and recorded in the constitution. Related specification changes MUST be recorded in the project change record. An amendment takes effect only after approval and the corresponding document update.

The constitution uses semantic versioning: MAJOR for incompatible changes to principles or governance; MINOR for adding a principle or materially expanding requirements; PATCH for clarifications and non-semantic wording changes. Every amendment MUST update the version and last-amended date. The original ratification date remains unchanged after adoption.

Each feature review MUST check compliance with the applicable principles and verify actual test evidence against acceptance criteria. Noncompliance or missing evidence MUST be reported and resolved before the work is considered complete.

**Version**: 1.0.0 | **Ratified**: 2026-11-19 | **Last Amended**: 2026-11-19
