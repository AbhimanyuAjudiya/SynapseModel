"""
Simple FastAPI Backend for Fluence VM Management
"""
import os
import asyncio
from datetime import datetime, UTC
from typing import Dict

import httpx
import uvicorn
import paramiko
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv


load_dotenv()

# Load environment variables

FLUENCE_API_KEY = os.getenv("FLUENCE_API_KEY")
FLUENCE_API_URL = os.getenv("FLUENCE_API_URL", "https://api.fluence.dev")

# Simple in-memory storage
vm_storage = {}  # public_key -> vm_data where vm_data = {vm_id, blob_id, status}

# Request models
class CreateVMRequest(BaseModel):
    public_key: str
    blob_id: str

# FastAPI app
app = FastAPI(title="Simple Fluence VM Manager")


# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

async def create_fluence_vm():
    """Create VM on Fluence"""
    headers = {
        "Authorization": f"Bearer {FLUENCE_API_KEY}",
        "Content-Type": "application/json"
    }

    # Read the public key from file
    try:
        with open("mykey.pub", "r") as f:
            pubkey = f.read().strip()
    except FileNotFoundError:
        print("❌ mykey.pub not found in current directory")
        return None

    vm_config = {
        "instances": 1,   # ✅ number of VMs
        "vmConfiguration": {
            "name": f"ai-vm-{datetime.now(UTC).strftime('%Y%m%d%H%M%S')}",
            "osImage": "https://cloud-images.ubuntu.com/releases/22.04/release/ubuntu-22.04-server-cloudimg-amd64.img",
            "resources": {
                "cpu": 2,
                "memory": "4Gi",
                "storage": "25Gi"
            },
            "sshKeys": [pubkey],
            "openPorts": [
                {
                    "port": 22,
                    "protocol": "tcp",
                    "description": "SSH access"
                },
                {
                    "port": 8000,
                    "protocol": "tcp",
                    "description": "App HTTP"
                }
            ]
        }
    }

    url = f"{FLUENCE_API_URL}/vms/v3"

    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(url, headers=headers, json=vm_config, timeout=60)
        except httpx.RequestError as e:
            print("❌ Network error when creating VM:", e)
            return None

        if response.status_code not in (200, 201):
            print("❌ Error creating VM. Status:", response.status_code)
            print("Response:", response.text)
            return None

        return response.json()

async def delete_fluence_vm(vm_id: str):
    """Delete VM on Fluence"""
    import http.client
    import json
    
    try:
        conn = http.client.HTTPSConnection("api.fluence.dev")
        payload = json.dumps({
            "vmIds": [vm_id]
        })
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {FLUENCE_API_KEY}'
        }
        
        conn.request("DELETE", "/vms/v3", payload, headers)
        res = conn.getresponse()
        data = res.read()
        
        if res.status not in (200, 204):
            print(f"❌ Error deleting VM. Status: {res.status}")
            print("Response:", data.decode("utf-8"))
            return False
            
        print(f"✅ VM {vm_id} deleted successfully")
        print("Response:", data.decode("utf-8"))
        return True
        
    except Exception as e:
        print(f"❌ Error deleting VM: {e}")
        return False
    finally:
        try:
            conn.close()
        except:
            pass

async def download_and_run_model(vm_id: str, blob_id: str, public_key: str):
    """Download blob and run AI model"""
    print(f"Starting model deployment for VM {vm_id}")
    
    # Update status
    if public_key in vm_storage:
        vm_storage[public_key]["status"] = "downloading_model"
    
    # For production: SSH into VM and run commands
    try:
        # First, wait for VM to be ready (poll VM status)   
        headers = {"Authorization": f"Bearer {FLUENCE_API_KEY}"}
        vm_ready = False
        max_wait = 300  # 5 minutes timeout
        wait_time = 0
        
        async with httpx.AsyncClient() as client:
            while not vm_ready and wait_time < max_wait:
                try:
                    response = await client.get(
                        f"{FLUENCE_API_URL}/vms/v3?vm_id={vm_id}", 
                        headers=headers,
                        timeout=30
                    )
                    
                    if response.status_code == 200:
                        vm_data = response.json()
                        vm_data = vm_data[0]
                        # Check if VM is running and has public IP
                        if (vm_data.get("status") == "Active" and 
                            vm_data.get("publicIp") and     
                            vm_data.get("publicIp") != ""):
                            vm_ready = True
                            vm_ip = vm_data["publicIp"]
                            break
                    
                    await asyncio.sleep(10)
                    wait_time += 10
                    print(f"Waiting for VM to be ready... ({wait_time}s)")
                    
                except Exception as e:
                    print(f"Error checking VM status: {e}")
                    await asyncio.sleep(10)
                    wait_time += 10
        
        if not vm_ready:
            print(f"❌ VM {vm_id} not ready after {max_wait}s")
            # Update status to error
            if public_key in vm_storage:
                vm_storage[public_key]["status"] = "deployment_error"
            return
        
        print(f"✅ VM ready at IP: {vm_ip}")
        
        # Wait for SSH to be available with retries
        ssh_ready = False
        ssh_wait_time = 0
        max_ssh_wait = 300  # 5 minutes for SSH to be ready
        
        while not ssh_ready and ssh_wait_time < max_ssh_wait:
            try:
                print(f"Testing SSH connection to {vm_ip}... ({ssh_wait_time}s)")
                
                # Test SSH connection
                ssh_test = paramiko.SSHClient()
                ssh_test.set_missing_host_key_policy(paramiko.AutoAddPolicy())
                
                ssh_test.connect(
                    hostname=vm_ip,
                    username='ubuntu',
                    key_filename='./mykey',
                    timeout=10  # Short timeout for testing
                )
                
                # If we get here, SSH is working
                ssh_test.close()
                ssh_ready = True
                print(f"✅ SSH connection established to {vm_ip}")
                break
                
            except Exception as e:
                print(f"SSH not ready yet: {str(e)[:100]}...")
                await asyncio.sleep(15)  # Wait longer between SSH attempts
                ssh_wait_time += 15
        
        if not ssh_ready:
            print(f"❌ SSH not available after {max_ssh_wait}s")
            if public_key in vm_storage:
                vm_storage[public_key]["status"] = "ssh_connection_failed"
            return
        
        # Now perform the actual deployment
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

        try:
            # Connect using private key with longer timeout
            ssh.connect(
                hostname=vm_ip,
                username='ubuntu',
                key_filename='./mykey',
                timeout=30
            )
            
            print("Executing deployment commands...")
            
            # Update status to downloading
            if public_key in vm_storage:
                vm_storage[public_key]["status"] = "downloading_model"
            
            # Execute commands sequentially
            # ssh.exec_command("mkdir -p /home/ubuntu/ggboi")
            
            # Download the model with progress tracking
            print("Downloading model...")
            stdin, stdout, stderr = ssh.exec_command(f'curl -L "https://aggregator.testnet.walrus.atalma.io/v1/blobs/by-object-id/${{blob_id}}" -o /home/ubuntu/my_zip.zip')
            
            # Install unzip package non-interactively
            stdin, stdout, stderr = ssh.exec_command('sudo apt-get update && sudo DEBIAN_FRONTEND=noninteractive apt-get install -y unzip')
            unzip_output = stdout.read().decode()
            unzip_errors = stderr.read().decode()
            print(f"Unzip install output: {unzip_output}")
            if unzip_errors:
                print(f"Unzip install errors: {unzip_errors}")


            # Unzip the downloaded file
            stdin, stdout, stderr = ssh.exec_command('unzip -o /home/ubuntu/my_zip.zip')


            #search for .sh file in the unzipped folder in /home/ubuntu directory
            stdin, stdout, stderr = ssh.exec_command('find /home/ubuntu -name "*.sh"')

            # get the first .sh file path
            sh_file_path = stdout.read().decode().strip().split('\n')[0]
            if not sh_file_path:
                raise Exception("No .sh file found in the unzipped folder")
            
            print(f"Found .sh file: {sh_file_path}")

            # Make the .sh file executable
            stdin, stdout, stderr = ssh.exec_command(f'chmod +x {sh_file_path}')
            chmod_output = stdout.read().decode()

            chmod_errors = stderr.read().decode()
            print(f"Chmod output: {chmod_output}")

            if chmod_errors:
                print(f"Chmod errors: {chmod_errors}")

            # Run the .sh file
            stdin, stdout, stderr = ssh.exec_command(f'bash {sh_file_path}')
            run_output = stdout.read().decode()
            run_errors = stderr.read().decode()
            print(f"Run script output: {run_output}")
            if run_errors:
                print(f"Run script errors: {run_errors}")
            

            # Wait for download to complete
            download_output = stdout.read().decode()
            download_errors = stderr.read().decode()
            
            if download_errors:
                print(f"Download stderr: {download_errors}")
            
            # Test basic command
            stdin, stdout, stderr = ssh.exec_command('whoami && ls -la /home/ubuntu/')
            command_output = stdout.read().decode()
            print(f"Command output: {command_output}")
            
        finally:
            ssh.close()

        print(f"✅ Model deployment completed on VM {vm_id}")
        
        # Update to running status
        if public_key in vm_storage:
            vm_storage[public_key]["status"] = "model_running"
        
    except paramiko.AuthenticationException as e:
        print(f"❌ SSH Authentication failed: {e}")
        if public_key in vm_storage:
            vm_storage[public_key]["status"] = "ssh_auth_failed"
    except paramiko.SSHException as e:
        print(f"❌ SSH connection error: {e}")
        if public_key in vm_storage:
            vm_storage[public_key]["status"] = "ssh_connection_error"
    except OSError as e:
        if "10060" in str(e):
            print(f"❌ Connection timeout - VM may still be booting or SSH not ready: {e}")
            if public_key in vm_storage:
                vm_storage[public_key]["status"] = "connection_timeout"
        else:
            print(f"❌ Network/OS error during SSH deployment: {e}")
            if public_key in vm_storage:
                vm_storage[public_key]["status"] = "network_error"
    except Exception as e:
        print(f"❌ Unexpected error during SSH deployment: {e}")
        if public_key in vm_storage:
            vm_storage[public_key]["status"] = "deployment_error"

# API Endpoints
@app.get("/health")
async def health_check():
    total_vms = len(vm_storage)
    return {"status": "healthy", "active_vms": total_vms}

@app.post("/api/v1/vms")
async def create_vm(request: CreateVMRequest):
    """Create VM and deploy AI model"""
    
    # Check if user already has a VM
    if request.public_key in vm_storage:
        raise HTTPException(400, "User already has a VM. Only one VM per public key is allowed.")
    
    # Create VM
    vm_result = await create_fluence_vm()
    if not vm_result:
        raise HTTPException(500, "Failed to create VM")
    
    # Extract VM ID from the response
    # The response structure may vary, let's handle different cases
    if isinstance(vm_result, list) and len(vm_result) > 0:
        vm_id = vm_result[0].get("vmId") or vm_result[0].get("id")
    elif isinstance(vm_result, dict):
        vm_id = vm_result.get("vmId") or vm_result.get("id") or vm_result.get("instances", [{}])[0].get("vmId")
    else:
        raise HTTPException(500, "Invalid VM response format")
    
    if not vm_id:
        raise HTTPException(500, "VM ID not found in response")
    
    # Create VM data
    vm_data = {
        "vm_id": vm_id,
        "blob_id": request.blob_id,
        "status": "creating",
        "created_at": datetime.now().isoformat()
    }
    
    # Store the VM data directly for the user
    vm_storage[request.public_key] = vm_data
    
    # Start model deployment in background
    asyncio.create_task(download_and_run_model(vm_id, request.blob_id, request.public_key))
    
    return {
        "vm_id": vm_id,
        "public_key": request.public_key,
        "blob_id": request.blob_id,
        "status": "creating",
        "message": "VM created, deploying model..."
    }


class DeleteVMRequest(BaseModel):
    public_key: str

@app.delete("/api/v1/vms/{vm_id}")
async def delete_vm(vm_id: str, request: DeleteVMRequest):
    """Delete VM"""
    
    if request.public_key not in vm_storage:
        raise HTTPException(404, "No VM found for this user")
    
    vm_data = vm_storage[request.public_key]
    
    # Check if the VM ID matches
    if vm_data["vm_id"] != vm_id:
        raise HTTPException(404, "VM not found for this user")
    
    # Delete VM on Fluence
    success = await delete_fluence_vm(vm_id)
    if not success:
        raise HTTPException(500, "Failed to delete VM on Fluence")
    
    # Remove from storage
    del vm_storage[request.public_key]
    
    return {"message": "VM deleted", "vm_id": vm_id}


@app.get("/api/v1/vms/detail/{vm_id}")
async def get_vm_detail(vm_id: str):
    """Get detailed VM information from Fluence API"""
    headers = {"Authorization": f"Bearer {FLUENCE_API_KEY}"}
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{FLUENCE_API_URL}/vms/v3?vm_id={vm_id}", 
                headers=headers,
                timeout=30
            )
            
            if response.status_code == 404:
                raise HTTPException(404, "VM not found")
            elif response.status_code != 200:
                raise HTTPException(500, f"Fluence API error: {response.status_code}")
                
            return response.json()
            
        except httpx.RequestError as e:
            raise HTTPException(500, f"Network error: {str(e)}")

@app.get("/api/v1/vm-id/{public_key}")
async def get_vm_id(public_key: str):
    """Get VM ID for a given public key"""
    
    if public_key not in vm_storage:
        raise HTTPException(404, "No VM found for this public key")
    
    vm_data = vm_storage[public_key]
    return {
        "public_key": public_key,
        "vm_id": vm_data["vm_id"]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)