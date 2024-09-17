# Besu and Kubernetes Cluster Setup Guide

This guide provides step-by-step instructions to set up a Besu blockchain network on a Kubernetes cluster using KIND, Helm, and various configurations.

## Prerequisites

Ensure the following tools are installed:
- [KIND](https://kind.sigs.k8s.io/docs/user/quick-start/) - Kubernetes IN Docker
- [kubectl](https://kubernetes.io/docs/tasks/tools/) - Command-line tool for Kubernetes
- [Helm](https://helm.sh/docs/intro/install/) - Kubernetes package manager

## Step 1: Create Kubernetes Cluster

```bash
kind create cluster --name cpc-besu
```

## Step 2: Update Configuration Files

kubectl get all --namespace=cpc-bes
helm list --namespace cpc-bes

## Step 3: Verify Cluster Creation
kubectl get all --namespace=cpc-bes
helm list --namespace cpc-bes


## Step 4: Install Genesis Node

helm install genesis ./besu-genesis --namespace cpc-bes --create-namespace --values ./values/noproxy-and-novault/genesis.yaml

## Step 5: Install Validators

helm install validator-1 ./besu-node --namespace cpc-bes --values ./values/noproxy-and-novault/validator.yaml
helm install validator-2 ./besu-node --namespace cpc-bes --values ./values/noproxy-and-novault/validator.yaml
helm install validator-3 ./besu-node --namespace cpc-bes --values ./values/noproxy-and-novault/validator.yaml
helm install validator-4 ./besu-node --namespace cpc-bes --values ./values/noproxy-and-novault/validator.yaml

## Step 6: Spin Up Besu and Transaction Node Pair

helm install member-1 ./besu-node --namespace cpc-bes --values ./values/noproxy-and-novault/txnode.yaml


## Step 7: Uninstall

helm list --namespace cpc-bes -q | xargs -I {} helm uninstall {} --namespace cpc-bes

kubectl delete namespace cpc-bes