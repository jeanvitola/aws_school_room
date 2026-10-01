<!--
Sync Impact Report
- Version change: placeholder scaffold -> 1.0.0
- Modified principles: New constitution aligned to quality, mandatory tests, separation of business logic from interfaces, and simplicity over premature abstraction.
- Added sections: Quality Standards; Development Workflow
- Removed sections: None
- Deferred items: RATIFICATION_DATE -> TODO(RATIFICATION_DATE): original adoption date is not yet established
-->

# My Project Constitution

## Core Principles

### I. Quality Before Speed
Every feature, bug fix, and refactor must prioritize code clarity, maintainability, and correctness over short-term delivery speed. We use explicit names, small functions, direct logic, and consistent structure. A change is not acceptable merely because it works in one path; it must remain understandable and safe for the next maintainer.

### II. Tests Are Mandatory
No user-visible behavior or business rule may be shipped without automated tests that cover the expected outcome and guard against regressions. Every new functionality requires a failing test before implementation, and the relevant test suite must pass before merge. When a defect is fixed, the regression is recorded in tests so it does not recur.

### III. Business Logic Must Be Separate from Interfaces
Domain rules and business workflows must live in logic layers independent from UI, transport, persistence, and framework concerns. Interface code may orchestrate and render behavior, but it must not contain the core rules of the system. This separation makes behavior testable, reusable, and resilient to interface changes.

### IV. Simplicity Over Premature Abstraction
We prefer the simplest implementation that solves the current problem and defer abstraction until duplication or variation has been proven by real needs. New abstractions must be justified by demonstrated complexity, not anticipated future flexibility. If a direct solution is clear and maintainable, the direct solution wins.

### V. Maintainability Through Small, Reviewable Changes
Changes must remain focused, incremental, and easy to review. Large refactors are allowed only when they are justified, isolated, and covered by tests that preserve the existing behavior. Each patch must have one clear purpose and must not mix unrelated concerns.

## Quality Standards
All code must follow established project conventions, use clear naming, and avoid hidden dependencies. We prefer explicit conditions over clever shortcuts, and we document non-obvious decisions when they are necessary. Code review is a quality gate: reviewers must verify correctness, test coverage, and readability before approval.

## Development Workflow
New functionality must begin with a failing or missing test, proceed through the smallest implementation that satisfies it, and end with a refactor only when the behavior is proven. Changes that affect business rules or contracts require validation of the affected scenarios, and merge decisions require evidence that the relevant tests pass. When complexity grows, we reduce it with clearer boundaries and simpler flows before adding infrastructure.

## Governance
This Constitution governs all software decisions within this project. Amendments require a documented rationale, a review of the impact on existing standards, and agreement from the maintainers before adoption. Changes to principles or required practices must be accompanied by a version bump and a brief migration note when existing work must adapt.

All code reviews and merge decisions must confirm compliance with this Constitution. When a rule conflicts with a shortcut or convenience-driven exception, the exception must be temporary, justified in writing, and reviewed with the next governance update. Complexity and abstraction are permitted only when they solve a real demonstrated need and are backed by tests.

**Version**: 1.0.0 | **Ratified**: TODO(RATIFICATION_DATE): original adoption date is not yet established | **Last Amended**: 2026-09-30
