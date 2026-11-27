variable "environment" {
  description = "Environment name (dev, sit, uat, prod)"
  type        = string
  default     = "sit"
}

variable "location" {
  description = "Azure region for all resources"
  type        = string
  default     = "eastus"
}

variable "resource_group_name" {
  description = "Resource group name"
  type        = string
  default     = "rg-budget-sit"
}

variable "backend_image" {
  description = "Container image for .NET backend API"
  type        = string
  default     = "ghcr.io/heyritikk/budget-backend:latest"
}

variable "frontend_image" {
  description = "Container image for Angular frontend web"
  type        = string
  default     = "ghcr.io/heyritikk/budget-frontend:latest"
}
