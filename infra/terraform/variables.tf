variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "ca-central-1"
}

variable "project_name" {
  description = "Project / resource name prefix"
  type        = string
  default     = "microforum"
}

variable "container_images" {
  description = "ECR image URIs for each microservice"
  type        = map(string)
  # Replace with your actual ECR URIs later
  default = {
    users   = "387324564533.dkr.ecr.ca-central-1.amazonaws.com/microforum-users:latest"
    posts   = "387324564533.dkr.ecr.ca-central-1.amazonaws.com/microforum-posts:latest"
    threads = "387324564533.dkr.ecr.ca-central-1.amazonaws.com/microforum-threads:latest"
  }
}
