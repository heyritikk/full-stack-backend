# 🎯 DevSecOps & Cloud Security — Interview Cheat Sheet (Ritik Kumar)

> **Background:** 1 Year .NET + Angular Developer → Transitioned to Intermediate DevSecOps & Cloud Security  
> **Project:** Budget Tracker (`.NET 10` + `Angular 17` + `Azure Container Apps` + `Terraform` + `Azure DevOps`)

---

## 1️⃣ 60-Second Project Pitch (Interview Opening)

> *"Main 1 saal se .NET aur Angular developer hoon, aur maine apne Budget Tracker project pe end-to-end DevSecOps aur Azure Cloud Security implement ki hai. Maine Azure DevOps mein CI aur CD pipelines ko separate kiya — CI (`develop`) pe automatic build ke saath **Gitleaks** (secrets), **SonarCloud** (SAST), **dotnet/npm audit** (SCA), **Hadolint** (Dockerfile lint), **Trivy** (container scan), aur **Checkov** (IaC scan) lagaye. Verified images `ghcr.io` pe push hoti hain, aur manual CD pipeline (`sit`) **passwordless OIDC** se **Terraform** chala kar Azure Container Apps, Key Vault (RBAC + Purge Protection), aur Managed Identity provision karti hai — aur deploy ke baad **OWASP ZAP (DAST)** live URL ko scan karta hai."*

---

## 2️⃣ Real Problems Jo Tune Khud Fix Kiye (Interviewers Love This!)

| Tool | Real Issue Jo Mila | Tune Kaise Fix Kiya | Interview Keyword |
|---|---|---|---|
| **Trivy** | `nginx:1.27-alpine` mein `pcre2`, `zlib`, `tiff` aur baad mein `libxml2` (7 HIGH CVEs) pakde | `USER root` → `apk upgrade` → `USER 101`, phir base image ko `alpine-slim` pe shift kiya | **Attack Surface Reduction & Non-Root Hardening** |
| **Checkov** | Key Vault pe `CKV_AZURE_189` (public access) aur `CKV2_AZURE_32` (private endpoint) fail hue | Triage kiya: SIT free tier mein PE cost avoid karne aur app access rakhne ke liye `network_acls = Deny` + `AzureServices` bypass rakha aur `#checkov:skip` with justification document kiya | **Risk Triage & Policy Exception** |
| **OIDC + Terraform** | `az login` Service Principal se Terraform fail hua (`AuthorizationFailed` & `Azure CLI auth only for User`) | Azure mein `Contributor` + `User Access Administrator` RBAC diya aur pipeline mein `addSpnToEnvironment: true` + `ARM_USE_OIDC=true` set kiya | **Passwordless Auth (OIDC) & Least Privilege** |
| **CI/CD Split** | Har push pe build + deploy dono chal rahe the | CI (`azure-pipelines.yml` on `develop`) aur CD (`azure-pipelines-sit.yml` manual on `sit`) alag kiye | **Build Once, Promote Everywhere** |

---

## 3️⃣ Top 10 Interview Questions & Short Answers

1. **SAST vs SCA vs DAST?**
   - **SAST (SonarCloud):** Apna source code scan karta hai bina run kiye (SQLi, XSS, bugs).
   - **SCA (Black Duck / `dotnet --vulnerable` / `npm audit`):** Third-party packages/libraries mein known CVEs & licenses check karta hai.
   - **DAST (OWASP ZAP):** Running live app/URL pe bahar se attack simulate karke security holes dhundhta hai.

2. **Shift-Left Security kya hai?**
   - Security checks ko deploy ke baad karne ke bajaye pipeline ke shuru (PR / commit stage) mein laana, taaki bugs aur CVEs saste mein aur jaldi pakde jaayein.

3. **Multi-stage Dockerfile aur Non-Root user kyun?**
   - Multi-stage se build tools/SDK final image mein nahi jaate (size aur attack surface kam). Non-root (`USER 101`) se agar container hack bhi ho, toh attacker ko root privileges nahi milte.

4. **OIDC / Workload Identity Federation kya hai?**
   - Pipeline aur Azure ke beech **bina client secret / password store kiye** short-lived token se authentication. Secret leak ya expiry ka risk khatam.

5. **Terraform State kahan rakhte hain aur kyun?**
   - Remote backend (**Azure Storage Account** `tfstate` container) mein — taaki team/pipeline share kar sake, state lock rahe, aur local machine pe secrets/state na rahe.

6. **Container Apps mein Key Vault kaise connect kiya?**
   - **User-Assigned Managed Identity** bana ke API Container App ko di, aur Key Vault pe RBAC role sirf **`Key Vault Secrets User`** diya (Least Privilege — delete/admin access nahi).

7. **Black Duck / Snyk jaise tools aur tere project ke tools mein kya relation hai?**
   - Black Duck enterprise **SCA** tool hai; mere project mein wahi kaam **`dotnet list --vulnerable`**, **`npm audit`**, aur **Trivy** karte hain.

8. **Agar Trivy ya Checkov mein false positive ya business exception aaye toh kya karte ho?**
   - Blindly ignore nahi karte — CVE ka fix check karte hain; agar unfixed ho ya environment constraint (jaise SIT free tier PE) ho, toh justification ke saath documented suppression (`.trivyignore` / `#checkov:skip`) lagate hain aur prod ke liye track karte hain.

---

## 4️⃣ Live Project URLs & Repos

- **App + Infra + Pipelines:** `https://github.com/heyritikk/full-stack-backend`
- **Database Repo:** `https://github.com/heyritikk/full-stack-database`
- **Azure DevOps:** `https://dev.azure.com/ritiik-kumar/ritik-kumar`
- **SonarCloud:** `https://sonarcloud.io/project/overview?id=heyritikk_full-stack-backend`
