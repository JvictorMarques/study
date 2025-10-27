#!/bin/bash

CLUSTER_NAME="${2:-kind}"

check_dependencies() {
  command -v docker >/dev/null 2>&1 || { echo >&2 "Docker is not installed. Aborting."; exit 1; }
  command -v kind >/dev/null 2>&1 || { echo >&2 "Kind is not installed. Aborting."; exit 1; }
  command -v kubectl >/dev/null 2>&1 || { echo >&2 "Kubectl is not installed. Aborting."; exit 1; }
}

delete_cluster() {
  kind delete cluster --name "$CLUSTER_NAME"
}

start_cluster() {
  if kind get clusters | grep -q "$CLUSTER_NAME"; then
    echo "Cluster '$CLUSTER_NAME' already exists. Exiting."
    exit 0
  fi

  kind create cluster --name "$CLUSTER_NAME" --config k8s/kind-config.yaml
  kubectl apply -f k8s/cluster
  kubectl apply -f k8s/dev/namespace.yaml
  kubectl apply -f k8s/dev/resource-quota.yaml
  kubectl apply -f k8s/dev/limit-range.yaml
  kubectl apply -f k8s/dev/
}

if [[ "$1" == "--delete" || "$1" == "-d" ]]; then
  echo "Deleting cluster '$CLUSTER_NAME'..."
  delete_cluster
  exit 0
fi

if [[ "$1" == "--restart" || "$1" == "-r" ]]; then
  check_dependencies
  delete_cluster
  start_cluster
  exit 0
fi

check_dependencies
start_cluster
echo "Cluster '$CLUSTER_NAME' is up and running."