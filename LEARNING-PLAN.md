# 🚀 DevSecOps Learning Plan — Ritik ka Project

> **Ye file mera step-by-step guide hai.**  
> Main beginner hoon. Har cheez yahan likhi hai — chhoti se chhoti bhi.  
> **Ek step complete karo, tick karo, next pe jao. Bas.**

---

## 📋 Mera Final Pipeline (Goal)

```
Code likhta hoon
      ↓
GitHub pe push karta hoon
      ↓
Azure DevOps Pipeline chalta hai automatically
  ├── 1. Build hota hai (.NET + Angular)
  ├── 2. SonarCloud — code mein bugs/security issues check
  ├── 3. OWASP — vulnerable packages check
  ├── 4. Trivy — Docker image scan
  └── 5. Docker image ban jaata hai
      ↓
ghcr.io pe image push hoti hai (free image store)
      ↓
Terraform — Azure ka infrastructure banata hai (code se!)
      ↓
Azure Container Apps pe deploy ho jaata hai (SIT environment)
      ↓
Azure SQL Database (free) — data store
```

**Cost = ₹0** 🎉

---

## ✅ Jo Ho Chuka Hai (Already Done!)

- [x] .NET backend bana liya
- [x] Angular frontend bana liya
- [x] Dockerfile bana liya (backend + frontend)
- [x] Docker Compose bana liya (local chalane ke liye)
- [x] GitHub pe code push kiya
- [x] GitHub Actions CI pipeline bani
- [x] Gitleaks — secret scan
- [x] SCA — vulnerable packages check (dotnet + npm)
- [x] Hadolint — Dockerfile lint
- [x] Branch strategy — feature → develop → sit → uat → main
- [x] JWT secret hardcode hata ke env var mein daal diya
- [x] Azure DevOps organization (`ritiik-kumar`) + project + GitHub connection
- [x] `azure-pipelines.yml` — .NET Backend + Angular Frontend build green ✅
- [x] **Trivy** — Docker image scan added & real HIGH CVEs (`pcre2`, `zlib`, `tiff`) patched in `budget-frontend/Dockerfile` (`USER root` → `apk upgrade` → `USER 101`) ✅
- [x] **SonarCloud (SAST)** — Account, token, extension, Service Connection (`SonarQube`), `@4` tasks in pipeline → green ✅
- [x] **Alag DB Repo (`full-stack-database`)** — `migrations/`, `stored-procedures/`, `seed-data/` + `main`, `develop`, `sit` branches pushed ✅

---

## 🗺️ Aage Ka Plan — 5 Steps

| Step | Kya karna hai | Status |
|------|--------------|--------|
| **Step 1** | Azure DevOps setup + pehli pipeline | ✅ Done |
| **Step 2** | Trivy add karo (image scan + CVE fix) | ✅ Done |
| **Step 3** | SonarCloud add karo (SAST) | ✅ Done |
| **Step 4** | Azure Budget Alert + Terraform (`infra/`) + Checkov (IaC scan) | 🔄 Next |
| **Step 5** | CD pipeline — `ghcr.io` push + SIT pe deploy | ⬜ Pending |

---

---

# STEP 1 — Azure DevOps Setup + Pehli Pipeline

## 1.1 Azure DevOps Organization Banao

**Kya hai:** Azure DevOps ek Microsoft ka tool hai jahan pipelines, boards, repos sab hote hain.

1. Browser mein jao: https://dev.azure.com
2. Microsoft account se login karo (wahi jo Azure subscription mein use kiya)
3. `+ New organization` pe click karo
4. Organization name likho — jaise `ritik-devops`
5. Region select karo — `South Asia` ya `East US`
6. `Continue` karo

✅ **Done hoga jab:** Dashboard dikhega `https://dev.azure.com/ritik-devops`

---

## 1.2 New Project Banao

1. `+ New project` pe click karo
2. Project name: `budget-tracker`
3. Visibility: `Private`
4. `Create` karo

✅ **Done hoga jab:** Project ka dashboard dikhega

---

## 1.3 GitHub Repo Ko Azure DevOps Se Connect Karo

**Kya hai:** Azure DevOps ko batana ki tera code GitHub pe hai.

1. Left sidebar mein `Pipelines` → `Pipelines` pe click karo
2. `Create Pipeline` pe click karo
3. `GitHub` select karo
4. GitHub account connect karne ka popup aayega — `Authorize` karo
5. Tera repo `heyritikk/full-stack-backend` dhundhkar select karo

✅ **Done hoga jab:** Repo select ho jaaye

---

## 1.4 Pehli Pipeline — Sirf Build (azure-pipelines.yml)

**Kya hai:** Ye file batati hai Azure DevOps ko ki pipeline mein kya kya karna hai.

1. Project root mein naya file banao: `azure-pipelines.yml`
2. Yeh content daalo:

```yaml
# azure-pipelines.yml
# Yeh meri pehli Azure DevOps pipeline hai
# Abhi sirf build karti hai — baad mein security tools add karenge

trigger:
  branches:
    include:
      - develop      # develop branch pe push hone pe chalegi
      - sit          # sit branch pe bhi

pool:
  vmImage: 'ubuntu-latest'   # pipeline kahan chalegi — Microsoft ka free server

stages:

  # ─── STAGE 1: Backend Build ───────────────────────────────
  - stage: Build_Backend
    displayName: 'Build .NET Backend'
    jobs:
      - job: Build
        steps:

          # Code download karo
          - task: Checkout@1
            displayName: 'Code download karo'

          # .NET install karo pipeline server pe
          - task: UseDotNet@2
            displayName: '.NET 10 install karo'
            inputs:
              version: '10.0.x'

          # Dependencies restore karo (NuGet packages)
          - script: dotnet restore InternalBudgetTracker.csproj
            workingDirectory: budget-backend
            displayName: 'NuGet packages restore karo'

          # Build karo
          - script: dotnet build InternalBudgetTracker.csproj -c Release --no-restore
            workingDirectory: budget-backend
            displayName: 'Backend build karo'

  # ─── STAGE 2: Frontend Build ──────────────────────────────
  - stage: Build_Frontend
    displayName: 'Build Angular Frontend'
    dependsOn: Build_Backend    # Backend build hone ke baad hi chalega
    jobs:
      - job: Build
        steps:

          - task: Checkout@1
            displayName: 'Code download karo'

          # Node.js install karo
          - task: NodeTool@0
            displayName: 'Node.js install karo'
            inputs:
              versionSpec: '22.x'

          # npm packages install karo
          - script: npm ci
            workingDirectory: budget-frontend
            displayName: 'npm packages install karo'

          # Angular build karo
          - script: npm run build -- --configuration production
            workingDirectory: budget-frontend
            displayName: 'Angular build karo'
```

3. File save karo
4. Git commit + push karo:

```bash
git add azure-pipelines.yml
git commit -m "ci: add Azure DevOps pipeline - build stage"
git push
```

5. Azure DevOps mein wapas jao → `Pipelines` → `New Pipeline` → Ye file select ho jaayegi → `Run` karo

✅ **Done hoga jab:** Pipeline green ✅ dikhegi

---

---

# STEP 2 — Trivy Add Karo (Docker Image Scan)

## Trivy Kya Hai?

**Simple explanation:** Tu Docker image banata hai. Trivy us image ke andar jhankta hai aur dekhta hai ki koi known virus/hack wali cheez (CVE) toh nahi hai packages mein.

**Real life example:** Jaise Amazon delivery box mein custom check hota hai — kuch banned item toh nahi — waise Trivy Docker image check karta hai.

## 2.1 Pipeline Mein Trivy Ka Stage Add Karo

`azure-pipelines.yml` mein `Build_Frontend` stage ke baad yeh add karo:

```yaml
  # ─── STAGE 3: Docker Build + Trivy Scan ──────────────────
  - stage: Docker_Security
    displayName: 'Docker Build + Trivy Scan'
    dependsOn: Build_Frontend
    jobs:
      - job: Trivy_Scan
        steps:

          - task: Checkout@1
            displayName: 'Code download karo'

          # Docker image banao (push nahi karenge abhi — sirf banayenge scan ke liye)
          - script: docker build -t budget-backend:test ./budget-backend
            displayName: 'Backend Docker image banao'

          # Trivy install karo pipeline pe
          - script: |
              curl -sfL https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin
            displayName: 'Trivy install karo'

          # Trivy se image scan karo
          # --exit-code 1 = HIGH/CRITICAL CVE milne pe pipeline fail kar do
          - script: |
              trivy image \
                --exit-code 1 \
                --severity HIGH,CRITICAL \
                --format table \
                budget-backend:test
            displayName: 'Trivy — Backend image scan karo'

          # Frontend image bhi banao aur scan karo
          - script: docker build -t budget-frontend:test ./budget-frontend
            displayName: 'Frontend Docker image banao'

          - script: |
              trivy image \
                --exit-code 1 \
                --severity HIGH,CRITICAL \
                --format table \
                budget-frontend:test
            displayName: 'Trivy — Frontend image scan karo'
```

## 2.2 Push Karo

```bash
git add azure-pipelines.yml
git commit -m "ci: add Trivy image scan stage"
git push
```

✅ **Done hoga jab:** Pipeline mein Trivy stage green dikhe. Agar koi HIGH/CRITICAL CVE hogi toh pipeline fail hogi — woh sahi hai, wahi chahiye.

---

---

# STEP 3 — SonarCloud Add Karo (Code Quality + SAST)

## SonarCloud Kya Hai?

**Simple explanation:** Tu code likhta hai. SonarCloud us code ko padhta hai aur batata hai:
- Yahan security issue hai (SQL injection, hardcoded password, etc.)
- Yahan bug hai
- Yahan code bura likha hai (code smell)

**GitHub Actions mein bhi tha?** Nahi tha — yeh pehli baar add ho raha hai. ✅

**Free hai?** Haan — public GitHub repo ke liye bilkul free.

## 3.1 SonarCloud Account Banao

1. Jao: https://sonarcloud.io
2. `Log in with GitHub` karo
3. `+` → `Analyze new project` → apna repo select karo `heyritikk/full-stack-backend`
4. SonarCloud ek **Organization Key** aur **Project Key** dega — note kar lo

```
Organization Key: heyritikk          (usually GitHub username)
Project Key:      heyritikk_full-stack-backend
```

## 3.2 SonarCloud Token Banao

1. SonarCloud mein jao: My Account → Security → Generate Token
2. Token ka naam: `azure-devops-token`
3. Generate karo → token copy karo (ek hi baar dikhega!)

## 3.3 Token Azure DevOps Mein Save Karo (Secret)

**Kya hai:** Token seedha pipeline file mein mat likhna — woh GitHub pe dikhega. Azure DevOps ke secrets mein store karo.

1. Azure DevOps → Project → `Project Settings` (bottom left)
2. `Service connections` → `New service connection`
3. `SonarCloud` dhundho → select karo
4. Token paste karo
5. Connection name: `SonarCloud`
6. Save karo

## 3.4 Pipeline Mein SonarCloud Add Karo

`Build_Backend` stage ke steps mein yeh add karo (restore ke baad, build se pehle):

```yaml
          # SonarCloud scan prepare karo
          - task: SonarCloudPrepare@2
            displayName: 'SonarCloud scan prepare karo'
            inputs:
              SonarCloud: 'SonarCloud'               # service connection naam
              organization: 'heyritikk'              # tera org key
              scannerMode: 'dotnet'
              projectKey: 'heyritikk_full-stack-backend'
              projectName: 'Budget Tracker'

          # (yahan restore aur build steps pehle se hain)

          # SonarCloud scan chalao
          - task: SonarCloudAnalyze@2
            displayName: 'SonarCloud scan chalao'

          # Result publish karo
          - task: SonarCloudPublish@2
            displayName: 'SonarCloud result publish karo'
            inputs:
              pollingTimeoutSec: '300'
```

## 3.5 Push Karo

```bash
git add azure-pipelines.yml
git commit -m "ci: add SonarCloud SAST scan"
git push
```

✅ **Done hoga jab:** SonarCloud dashboard pe tera project dikhne lage aur bugs/issues report aaye.

---

---

# STEP 4 — Terraform Se Azure Infra Banao

## Terraform Kya Hai?

**Simple explanation:** Normally tu Azure portal pe jaata hai, button click karta hai, resource banata hai. 

Terraform mein yeh sab **code se hota hai**:
```hcl
# main.tf
resource "azurerm_container_app" "api" {
  name = "budget-api"
  ...
}
```

Yeh code run karo → Azure pe automatically sab ban jaata hai. **Infrastructure as Code (IaC).**

**Faayda:**
- Galti nahi hoti (human error nahi)
- Delete karo → dobara banao → same cheez banti hai
- SIT, UAT, Prod — ek hi code se teen environments!

## 4.1 Terraform Files Ka Structure

Project mein `infra/` folder banao:

```
infra/
  ├── main.tf           # sab resources yahan
  ├── variables.tf      # values yahan (env ke hisaab se change hoti hain)
  ├── outputs.tf        # terraform ke results (URLs, IPs)
  └── terraform.tfvars  # actual values (git mein mat daalna!)
```

## 4.2 variables.tf — Kya Kya Cheezein Badlegi

```hcl
# infra/variables.tf

variable "environment" {
  description = "Environment naam — dev, sit, uat, prod"
  type        = string
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "East US"
}

variable "resource_group_name" {
  description = "Resource group naam"
  type        = string
}
```

## 4.3 main.tf — Azure Resources Banao

```hcl
# infra/main.tf

# Azure provider — Terraform ko batao ki Azure use karna hai
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# ─── Resource Group ───────────────────────────────────────
# Sab resources ek folder (resource group) mein rahenge
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name    # jaise "rg-budget-sit"
  location = var.location
  
  tags = {
    environment = var.environment
    project     = "budget-tracker"
    owner       = "ritik"
  }
}

# ─── Log Analytics Workspace ──────────────────────────────
# Logs store karne ke liye — free tier
resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-budget-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30    # 30 din ke logs rakhenge
}

# ─── Container Apps Environment ───────────────────────────
# Yahan API aur Web dono chalenge
resource "azurerm_container_app_environment" "main" {
  name                       = "cae-budget-${var.environment}"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
}

# ─── Container App — API (.NET Backend) ───────────────────
resource "azurerm_container_app" "api" {
  name                         = "ca-budget-api-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  template {
    container {
      name   = "api"
      image  = "ghcr.io/heyritikk/budget-backend:latest"  # ghcr.io — free!
      cpu    = 0.25    # minimum — cheap
      memory = "0.5Gi"
    }
    
    # Scale to zero — koi request nahi = container band = ₹0
    min_replicas = 0
    max_replicas = 1
  }

  ingress {
    external_enabled = true    # internet se accessible
    target_port      = 8080
    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }
}

# ─── Container App — Web (Angular Frontend) ───────────────
resource "azurerm_container_app" "web" {
  name                         = "ca-budget-web-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  template {
    container {
      name   = "web"
      image  = "ghcr.io/heyritikk/budget-frontend:latest"
      cpu    = 0.25
      memory = "0.5Gi"
    }
    min_replicas = 0
    max_replicas = 1
  }

  ingress {
    external_enabled = true
    target_port      = 8080
    traffic_weight {
      latest_revision = true
      percentage      = 100
    }
  }
}
```

## 4.4 outputs.tf — URLs Note Karo

```hcl
# infra/outputs.tf

output "api_url" {
  description = "Backend API ka URL"
  value       = "https://${azurerm_container_app.api.latest_revision_fqdn}"
}

output "web_url" {
  description = "Frontend ka URL"
  value       = "https://${azurerm_container_app.web.latest_revision_fqdn}"
}
```

## 4.5 Terraform Locally Test Karo (Pehle Local, Phir Pipeline)

```bash
# Azure mein login karo
az login

# infra folder mein jao
cd infra

# Terraform initialize karo (pehli baar)
terraform init

# Kya banega — dry run (kuch create nahi hoga abhi)
terraform plan -var="environment=sit" -var="resource_group_name=rg-budget-sit"

# Actual banao
terraform apply -var="environment=sit" -var="resource_group_name=rg-budget-sit"
```

✅ **Done hoga jab:** Azure portal mein `rg-budget-sit` resource group dikhe aur andar Container Apps hon.

## 4.6 Terraform State Remotely Save Karo (Azure Storage)

> ⚠️ Yeh important hai — Terraform ek file rakhta hai `terraform.tfstate` jisme resource info hoti hai. Isse local mat rakhna — Azure Storage pe rakhna.

```bash
# Storage account banao (ek baar)
az group create --name rg-terraform-state --location eastus
az storage account create --name ritiktfstate --resource-group rg-terraform-state --sku Standard_LRS
az storage container create --name tfstate --account-name ritiktfstate
```

`main.tf` mein add karo (top pe):
```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "rg-terraform-state"
    storage_account_name = "ritiktfstate"
    container_name       = "tfstate"
    key                  = "sit.terraform.tfstate"
  }
}
```

---

---

# STEP 5 — CD Pipeline: Image Push + Deploy

## 5.1 ghcr.io Access Setup Karo (Free Image Store)

**Kya hai:** ghcr.io = GitHub Container Registry. Docker Hub ki tarah but free aur GitHub se connected.

1. GitHub → Settings → Developer Settings → Personal Access Tokens → Tokens (classic)
2. `Generate new token`
3. Naam: `ghcr-push-token`
4. Permissions select karo: `write:packages`, `read:packages`, `delete:packages`
5. Generate → Token copy karo

6. Azure DevOps → Project Settings → Library → Variable Groups → `+ Variable group`
7. Naam: `secrets`
8. Add karo:
   - `GHCR_TOKEN` = tera token (lock icon pe click karo — secret banao)
   - `GHCR_USERNAME` = `heyritikk`

## 5.2 CD Pipeline — Image Push + Deploy

`azure-pipelines.yml` mein add karo (Trivy stage ke baad):

```yaml
  # ─── STAGE 4: Image Push to ghcr.io ──────────────────────
  - stage: Push_Image
    displayName: 'Docker Image Push karo (ghcr.io)'
    dependsOn: Docker_Security    # Trivy pass hone ke baad hi push hoga
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/develop'))
    variables:
      - group: secrets    # Variable group se secrets lo
    jobs:
      - job: Push
        steps:

          - task: Checkout@1

          # ghcr.io pe login karo
          - script: |
              echo $(GHCR_TOKEN) | docker login ghcr.io -u $(GHCR_USERNAME) --password-stdin
            displayName: 'ghcr.io login karo'

          # Backend image banao aur push karo
          # Tag: commit SHA se — taki exact version pata rahe
          - script: |
              docker build -t ghcr.io/heyritikk/budget-backend:$(Build.SourceVersion) ./budget-backend
              docker push ghcr.io/heyritikk/budget-backend:$(Build.SourceVersion)
            displayName: 'Backend image push karo'

          # Frontend image push karo
          - script: |
              docker build -t ghcr.io/heyritikk/budget-frontend:$(Build.SourceVersion) ./budget-frontend
              docker push ghcr.io/heyritikk/budget-frontend:$(Build.SourceVersion)
            displayName: 'Frontend image push karo'

  # ─── STAGE 5: Terraform + Deploy to SIT ──────────────────
  - stage: Deploy_SIT
    displayName: 'SIT pe Deploy karo'
    dependsOn: Push_Image
    condition: and(succeeded(), eq(variables['Build.SourceBranch'], 'refs/heads/sit'))
    jobs:
      - deployment: Deploy
        environment: 'SIT'       # Azure DevOps environment (approval gate laga sakte hain)
        strategy:
          runOnce:
            deploy:
              steps:

                - task: Checkout@1

                # Terraform install karo
                - task: TerraformInstaller@1
                  displayName: 'Terraform install karo'
                  inputs:
                    terraformVersion: 'latest'

                # Azure login karo (Service Connection se)
                - task: TerraformTaskV4@4
                  displayName: 'Terraform Init'
                  inputs:
                    provider: 'azurerm'
                    command: 'init'
                    workingDirectory: '$(System.DefaultWorkingDirectory)/infra'
                    backendServiceArm: 'Azure-Connection'

                # Dry run — kya banega/badlega
                - task: TerraformTaskV4@4
                  displayName: 'Terraform Plan (dry run)'
                  inputs:
                    provider: 'azurerm'
                    command: 'plan'
                    workingDirectory: '$(System.DefaultWorkingDirectory)/infra'
                    environmentServiceNameAzureRM: 'Azure-Connection'
                    commandOptions: '-var="environment=sit" -var="resource_group_name=rg-budget-sit"'

                # Actual deploy
                - task: TerraformTaskV4@4
                  displayName: 'Terraform Apply (deploy karo)'
                  inputs:
                    provider: 'azurerm'
                    command: 'apply'
                    workingDirectory: '$(System.DefaultWorkingDirectory)/infra'
                    environmentServiceNameAzureRM: 'Azure-Connection'
                    commandOptions: '-auto-approve -var="environment=sit" -var="resource_group_name=rg-budget-sit"'
```

## 5.3 Azure Service Connection Banao (Pipeline → Azure)

**Kya hai:** Azure DevOps ko permission deni hoti hai Azure mein changes karne ki.

1. Azure DevOps → Project Settings → Service Connections
2. `New service connection` → `Azure Resource Manager`
3. `Service principal (automatic)` select karo
4. Apna Azure subscription select karo
5. Connection naam: `Azure-Connection`
6. Save karo

✅ **Done hoga jab:** Pipeline successfully Azure pe deploy kare aur Container Apps URL aaye.

---

---

# 📊 Mera Progress Tracker

## Step 1 — Azure DevOps Setup
- [x] Azure DevOps organization banayi (`https://dev.azure.com/ritiik-kumar`)
- [x] Project banaya (`ritik-kumar`)
- [x] GitHub repo connect kiya (`heyritikk/full-stack-backend`)
- [x] `azure-pipelines.yml` file banayi (`develop` branch pe)
- [x] Pehli pipeline green ✅ aayi (Angular CSS budget dev config fix ke saath)

## Step 2 — Trivy (Container Security)
- [x] Trivy stage pipeline mein add kiya
- [x] Ek baar real HIGH CVEs (`pcre2`, `zlib`, `tiff`) aayi aur pipeline fail hui — gate verify hua ✅
- [x] `budget-frontend/Dockerfile` mein `USER root` → `apk upgrade --no-cache` → `USER 101` karke CVEs patch ki
- [x] Pipeline mein Trivy green ✅ aayi

## Step 3 — SonarCloud (SAST)
- [x] SonarCloud account banaya (`heyritikk`) & Automatic Analysis OFF kiya
- [x] Token banaya + SonarQube Cloud extension install kiya
- [x] Azure DevOps service connection set kiya (`SonarQube`)
- [x] Pipeline mein SonarCloud `@4` tasks add kiye (`SonarCloudPrepare@4`, `Analyze@4`, `Publish@4`)
- [x] Pipeline green ✅ + SonarCloud dashboard pe report dikha

## Step 3.5 — Alag DB Repo (MNC Style)
- [x] `https://github.com/heyritikk/full-stack-database` banaya
- [x] `migrations/`, `stored-procedures/`, `seed-data/` folders + starter SQL files banaye
- [x] `main`, `develop`, `sit` branches push ki

## Step 4 — Terraform + Cloud Security
- [x] Azure Free Trial spending cap verified (₹19,046 credits)
- [x] `infra/` folder banaya project mein (`main.tf`, `variables.tf`, `outputs.tf`)
- [x] Key Vault (RBAC + Purge Protection + Network ACLs) + Managed Identity + Container Apps (`min_replicas = 0`)
- [x] **Checkov** (IaC security scanner) pipeline mein add kiya & Key Vault exceptions document kiye
- [x] Azure Service Connection (`azure-connections` via **OIDC**) + RBAC (`Contributor` + `User Access Administrator`)
- [x] Remote state Azure Storage (`rg-terraform-state` / `ritiktfstate2026`) mein set kiya
- [x] `terraform apply` pipeline se chala — Azure pe `rg-budget-sit` live bana ✅

## Step 5 — CD Pipeline (SIT Deploy + DAST)
- [x] `ghcr.io` token banaya & `secrets` variable group mein save kiya
- [x] Image push stage kaam kiya — `ghcr.io` pe public images push hui
- [x] CI (`azure-pipelines.yml` — `develop` auto) aur CD (`azure-pipelines-sit.yml` — `sit` manual) alag kiye
- [x] SIT deploy stage kaam kiya — Azure Container Apps pe app live chali ✅
- [x] **OWASP ZAP (DAST)** live SIT URL pe add kiya & HTML report artifact upload hua ✅

---

## ⚠️ Important Rules (Bhoolna Mat!)

1. **Kabhi bhi secrets git mein mat daalo** — token, password, kuch bhi
2. **`terraform.tfvars` git mein mat daalo** — `.gitignore` mein add karo
3. **Testing ke baad Azure resources delete karo:**
   ```bash
   az group delete --name rg-budget-sit --yes
   ```
   Warna free tier khatam ho sakta hai
4. **Pehle local test karo, phir pipeline mein daalo**
5. **Ek kaam ek PR** — ek PR mein bohot zyada mat karo

---

## 🆘 Agar Kuch Kaam Na Kare

| Problem | Solution |
|---------|---------|
| Pipeline fail ho | Error message padhlo — 90% baar wahan answer hota hai |
| Terraform error aaye | `terraform plan` output padhlo carefully |
| Azure login issue | `az login` dobara karo |
| ghcr.io push fail | Token ka `write:packages` permission check karo |
| SonarCloud scan na aaye | Service Connection naam check karo — exact match chahiye |

---

## 📞 Reference Links

- Azure DevOps: https://dev.azure.com
- SonarCloud: https://sonarcloud.io
- Trivy docs: https://aquasecurity.github.io/trivy
- Terraform Azure docs: https://registry.terraform.io/providers/hashicorp/azurerm
- ghcr.io docs: https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry

---

*Last updated: 2026-11-28 | Current status: CI + DevSecOps + Azure SIT Live + DAST Complete! 🎉*
