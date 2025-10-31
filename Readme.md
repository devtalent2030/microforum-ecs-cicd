# microforum-ecs-cicd

> Production-grade, cloud-ready deployment of a microservices forum on **AWS ECS Fargate** with **path-based routing**, **blue/green CI/CD** (CodePipeline/CodeBuild/CodeDeploy), **ECR**, and **Terraform IaC**. Includes local Docker Compose, autoscaling, observability, security hardening, and cost guidance.

---

<p align="center">
  <img src="https://img.shields.io/badge/AWS-ECS%20Fargate-orange" />
  <img src="https://img.shields.io/badge/IaC-Terraform-7B42BC" />
  <img src="https://img.shields.io/badge/CI%2FCD-CodePipeline%2FCodeBuild%2FCodeDeploy-success" />
  <img src="https://img.shields.io/badge/Containers-Docker-blue" />
  <img src="https://img.shields.io/badge/License-MIT-lightgrey" />
</p>

## What this repo demonstrates

* **Microservices** (`users`, `posts`, `threads`) containerized with Docker and runnable locally via Docker Compose.
* **Infrastructure as Code**: VPC, ALB, ECS/Fargate, ECR, IAM, autoscaling, CloudWatch, CodePipeline—declared with Terraform.
* **Blue/Green Deployments** on ECS via CodeDeploy with health checks & automatic rollback.
* **Scalability & Resilience**: ALB path-based routing, target tracking autoscaling, multi‑AZ design.
* **Portability**: Same containers run locally and in the cloud. No machine lock‑in.
* **Observability & Security**: Service logs/metrics, ALB access logs, least‑privilege IAM, HTTPS via ACM.

---

## Architecture (high-level)

```mermaid
flowchart LR
  U((Users)) -->|HTTPS| ALB[Application Load Balancer]
  ALB -->|/users/*| TG1((TG Users))
  ALB -->|/posts/*| TG2((TG Posts))
  ALB -->|/threads/*| TG3((TG Threads))

  subgraph Private Subnets
    TG1 --> S1[ECS Service: users (Fargate)]
    TG2 --> S2[ECS Service: posts (Fargate)]
    TG3 --> S3[ECS Service: threads (Fargate)]
  end

  subgraph CI/CD
    SRC[(Git Repo)] --> CPL[CodePipeline]
    CPL --> CB[CodeBuild] --> ECR[(ECR images)]
    ECR --> CDP[CodeDeploy ECS Blue/Green] --> S1 & S2 & S3
  end
```

---

## Repository layout

```
repo-root/
  users/           # Koa service, Dockerfile, db.json, server.js (+ /health)
  posts/           # Koa service, Dockerfile, db.json, server.js (+ /health)
  threads/         # Koa service, Dockerfile, db.json, server.js (+ /health)
  compose.yaml     # Local orchestration for all services
  infra/
    terraform/     # VPC, Subnets, ALB, ECR, ECS, IAM, CI/CD, autoscaling
  buildspecs/      # CodeBuild specs per service
  docs/            # Diagrams, cost notes, runbooks
```

---

## R1–R7 Requirement Mapping

| Req | Description            | How it’s satisfied                                                                        |
| --- | ---------------------- | ----------------------------------------------------------------------------------------- |
| R1  | Design diagram         | Mermaid diagram in README + docs/architecture.png                                         |
| R2  | Cost optimized         | Fargate (serverless), right-size tasks, autoscaling, minimal LCUs, NAT avoidance guidance |
| R3  | Microservices          | 3 ECS services (users/posts/threads), independent scaling                                 |
| R4  | Portability            | Dockerized services; same images local & prod                                             |
| R5  | Scalability/resilience | ALB path-based routing, health checks, multi‑AZ, autoscaling                              |
| R6  | Automated CI/CD        | CodePipeline → CodeBuild → CodeDeploy (ECS blue/green)                                    |
| R7  | IaC                    | Terraform modules for all AWS resources                                                   |

---

## Quickstart (Local)

**Prereqs:** Docker Desktop (or engine), Make (optional), Node.js (if you run services directly)

```bash
# from repo-root
docker compose up --build
# Health checks
curl -s localhost:3001/health | jq
curl -s localhost:3002/health | jq
curl -s localhost:3003/health | jq
```

---

## Cloud Deploy (AWS)

**Prereqs:** Terraform, AWS CLI (with creds), an ACM cert for your domain (optional for HTTPS), an S3 bucket & DynamoDB table for TF state (recommended).

```bash
# 1) Initialize & preview
cd infra/terraform
terraform init
terraform plan -out tf.plan

# 2) Apply
terraform apply tf.plan
```

Output values will include: ALB DNS name, ECR repo URIs, ECS cluster name.

---

## CI/CD (ECR → ECS Blue/Green)

* **Source**: GitHub/CodeCommit main branch.
* **Build**: CodeBuild builds & scans images (Trivy optional), pushes to ECR, emits `imagedefinitions.json`.
* **Deploy**: CodeDeploy ECS blue/green per service; traffic shifts only if health checks pass; auto‑rollback on alarms.

> **Note:** This repo includes example buildspecs and Terraform to provision CodePipeline/Build/Deploy. Update variables for your account/region and Git connection.

---

## Cost Notes

* Fargate pricing = vCPU + GB‑RAM × task‑hours. Start small (e.g., 0.25 vCPU/0.5–1GB) and scale up only as needed.
* ALB hourly + LCU (requests/bandwidth). For student envs, keep traffic low and stop non‑prod at night.
* NAT is costly—prefer VPC endpoints or public egress only where safe.

---

## Security & Observability

* **Security**: least‑privilege IAM roles; ECR private; secrets via SSM Parameter Store; HTTPS with ACM; SGs locked to necessary ports.
* **Logging/Monitoring**: CloudWatch Logs per task; ALB access logs; autoscaling metrics; optional X‑Ray.
* **Quality Gates**: lint/tests in CI; container scan (fail on CRITICAL); post‑deploy smoke tests.

---

## Roadmap

* Add `/version` endpoint exposing commit SHA.
* Canary deploys with weighted listeners.
* Integration tests against ALB in CI.
* SRE runbooks (rollback, incident checklists).

---

## License

MIT — see [LICENSE](LICENSE).

## Author / Contact

**Talent Nyota** — Cloud & Platform Engineering

* Email: [trnyota@gmail.com](mailto:trnyota@gmail.com)
* LinkedIn: [https://www.linkedin.com/in/talentnyota/](https://www.linkedin.com/in/talentnyota/)
* GitHub: [https://github.com/devtalent2030](https://github.com/devtalent2030)