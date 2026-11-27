terraform {
  required_version = ">= 1.5.0"

  backend "azurerm" {}

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.100"
    }
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = false
      recover_soft_deleted_key_vaults = true
    }
  }
}

data "azurerm_client_config" "current" {}

# 1. Resource Group — sab SIT resources ek jagah
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location

  tags = {
    environment = var.environment
    project     = "budget-tracker"
    managed_by  = "terraform"
  }
}

# 2. User-Assigned Managed Identity — API ko bina password Azure access dene ke liye
resource "azurerm_user_assigned_identity" "api" {
  name                = "id-budget-api-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

# 3. Log Analytics Workspace — centralized logs (5 GB/month free)
resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-budget-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# 4. Azure Key Vault — secrets store (RBAC + Purge Protection + Network ACLs)
resource "azurerm_key_vault" "main" {
  #checkov:skip=CKV_AZURE_189:Public access kept for SIT free tier; network_acls default_action=Deny + AzureServices bypass enforced
  #checkov:skip=CKV2_AZURE_32:Private endpoint skipped in SIT free tier to keep cost zero; enabled in prod
  name                        = "kv-budget-${var.environment}-rk"
  location                    = azurerm_resource_group.main.location
  resource_group_name         = azurerm_resource_group.main.name
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  sku_name                    = "standard"
  enable_rbac_authorization   = true
  purge_protection_enabled    = true
  soft_delete_retention_days  = 90
  enabled_for_disk_encryption = true

  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"
  }
}

# 5. Least Privilege RBAC — API identity ko sirf secrets read karne ki permission
resource "azurerm_role_assignment" "api_kv_secrets_user" {
  scope                = azurerm_key_vault.main.id
  role_definition_name = "Key Vault Secrets User"
  principal_id         = azurerm_user_assigned_identity.api.principal_id
}

# 6. Container Apps Environment
resource "azurerm_container_app_environment" "main" {
  name                       = "cae-budget-${var.environment}"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
}

# 7. Container App — .NET Backend API (scale to zero = free when idle)
resource "azurerm_container_app" "api" {
  name                         = "ca-budget-api-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  identity {
    type         = "UserAssigned"
    identity_ids = [azurerm_user_assigned_identity.api.id]
  }

  template {
    min_replicas = 0
    max_replicas = 1

    container {
      name   = "api"
      image  = var.backend_image
      cpu    = 0.25
      memory = "0.5Gi"
    }
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

# 8. Container App — Angular Frontend Web (scale to zero = free when idle)
resource "azurerm_container_app" "web" {
  name                         = "ca-budget-web-${var.environment}"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"

  template {
    min_replicas = 0
    max_replicas = 1

    container {
      name   = "web"
      image  = var.frontend_image
      cpu    = 0.25
      memory = "0.5Gi"
    }
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
