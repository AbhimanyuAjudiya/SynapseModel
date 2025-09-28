variable "fluence_api_key" {
  type        = string
  description = "Fluence API key. (Recommended: set via env var FLUENCE_API_KEY)"
}

variable "vm_name" {
  type    = string
  default = "my-fluence-vm"
}

variable "ssh_public_key_file" {
  type    = string
  default = "manage_keys.pub"
}

variable "ssh_private_key_file" {
  type    = string
  default = "manage_keys"
}

variable "ssh_user" {
  type    = string
  default = "ubuntu" # change if image has a different default user
}

variable "os_image" {
  type    = string
  default = "https://cloud-images.ubuntu.com/releases/22.04/release/ubuntu-22.04-server-cloudimg-amd64.img"
}

variable "basic_configuration" {
  type    = string
  default = "small"
}
