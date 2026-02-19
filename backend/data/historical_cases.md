# Historical Fraud Cases (Sanitized)

## Case ATO-4421
- Scenario: Customer account takeover through phishing + credential stuffing.
- Signals: New device fingerprint, failed MFA attempts, instant beneficiary addition, large transfer request.
- Resolution: Automated risk engine blocked transfer; SOC reset credentials and re-verified customer.
- Lesson: Beneficiary cooldown reduced immediate fraud success.

## Case CARD-9012
- Scenario: Card present fraud after skimming compromise.
- Signals: Clustered petrol pump transactions followed by ATM cash-outs.
- Resolution: Velocity rule and geo-rule stopped transactions after third anomaly.
- Lesson: Rule threshold tuning lowered false positives while preserving fraud catch rate.

## Case PHISH-1108
- Scenario: Smishing campaign targeted payroll customers with fake KYC links.
- Signals: Spike in customer complaints and repeated malicious domains.
- Resolution: Domain takedown + customer alert campaign + temporary high-risk transaction checks.
- Lesson: Faster IOC sharing with SOC cut campaign duration by 40%.
