terraform {
  required_providers {
    fluence = {
      source = "decentralized-infrastructure/fluence"
      version = "1.3.0"
    }
  }
}

provider "fluence" {
    api_key = var.fluence_api_key
  # The provider reads FLUENCE_API_KEY from environment by default
  # (you can also pass it here: api_key = var.fluence_api_key)
}

# create an ssh key resource using the local public key file
resource "fluence_ssh_key" "deploy_key" {
  name       = "deploy-key-${random_id.suffix.hex}"
  public_key = file(var.ssh_public_key_file)
}

resource "random_id" "suffix" {
  byte_length = 4
}

# create a VM
resource "fluence_vm" "app" {
  name     = var.vm_name
  os_image = var.os_image
  ssh_keys = [fluence_ssh_key.deploy_key.fingerprint]

  open_ports = [{
    port     = 22
    protocol = "tcp"
  },{
    port     = 80
    protocol = "tcp"
  },{
    port     = 443
    protocol = "tcp"
  }
  ]

  instances           = 1
  basic_configuration = var.basic_configuration

  # OPTIONAL: simple inline provisioner — will run *after* provider reports the instance is created.
  # NOTE: the host attribute below is a placeholder; see comment after the block.
}
