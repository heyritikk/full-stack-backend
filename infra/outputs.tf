output "api_url" {
  description = "Public URL of the Backend API Container App"
  value       = "https://${azurerm_container_app.api.latest_revision_fqdn}"
}

output "web_url" {
  description = "Public URL of the Frontend Web Container App"
  value       = "https://${azurerm_container_app.web.latest_revision_fqdn}"
}

output "key_vault_uri" {
  description = "Azure Key Vault URI"
  value       = azurerm_key_vault.main.vault_uri
}

output "api_identity_principal_id" {
  description = "Managed Identity Principal ID for API"
  value       = azurerm_user_assigned_identity.api.principal_id
}
