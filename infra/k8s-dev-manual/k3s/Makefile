.PHONY: all deploy-k3s exkc fp install-helm remove-traefik install-k9s install-skaffold setup-k3s setup-tools help

# Default target - shows help
help:
	@echo "K3s Setup Makefile"
	@echo "=================="
	@echo ""
	@echo "Available targets:"
	@echo "  make setup-k3s           - Deploy K3s, configure kubeconfig, and fix permissions"
	@echo "  make setup-tools         - Install helm, k9s, and skaffold"
	@echo "  make all                 - Run complete setup (k3s + tools + remove traefik)"
	@echo ""
	@echo "Individual targets:"
	@echo "  make deploy-k3s           - Deploy K3s cluster"
	@echo "  make exkc  					  - Export KUBECONFIG environment variable"
	@echo "  make fp                   - Fix kubectl permissions (run after k3s restart)"
	@echo "  make install-helm         - Install Helm package manager"
	@echo "  make remove-traefik       - Remove Traefik gateway (for using another gateway like Kong)"
	@echo "  make install-k9s          - Install k9s terminal UI"
	@echo "  make install-skaffold     - Install Skaffold"

# Complete setup
all: setup-k3s remove-traefik setup-tools
	@echo "✓ K3s cluster setup complete!"
	@echo "Note: Run 'export KUBECONFIG=/etc/rancher/k3s/k3s.yaml' in your shell"

# K3s setup
setup-k3s: deploy-k3s configure-kubeconfig fix-permissions
	@echo "✓ K3s cluster is ready"

# Tools setup
setup-tools: install-helm install-k9s install-skaffold
	@echo "✓ All tools installed"

# 1. Deploy K3s
deploy-k3s:
	@echo "Deploying K3s cluster..."
	curl -sfL https://get.k3s.io | sh -
	@echo "Waiting for node to be ready..."
	@sleep 10
	sudo k3s kubectl get node
	@echo "✓ K3s deployed"

# 2. Configure kubeconfig path
exkc:
	@echo "Configuring KUBECONFIG..."
	@echo "Note: Add 'export KUBECONFIG=/etc/rancher/k3s/k3s.yaml' to your shell profile"
	@echo "For current session, run: export KUBECONFIG=/etc/rancher/k3s/k3s.yaml"
	@echo ""
	@echo "To add to ~/.bashrc automatically, run: make exkc-bashrc"

# Add KUBECONFIG to .bashrc (optional)
exkc-bashrc:
	@echo "Adding KUBECONFIG to ~/.bashrc..."
	@if ! grep -q "KUBECONFIG=/etc/rancher/k3s/k3s.yaml" ~/.bashrc 2>/dev/null; then \
		echo 'export KUBECONFIG=/etc/rancher/k3s/k3s.yaml' >> ~/.bashrc; \
		echo "✓ Added KUBECONFIG to ~/.bashrc"; \
		echo "Run 'source ~/.bashrc' to apply changes"; \
	else \
		echo "KUBECONFIG already exists in ~/.bashrc"; \
	fi

# 3. Fix kubectl permissions
fp:
	@echo "Fixing kubectl permissions..."
	sudo chmod 644 /etc/rancher/k3s/k3s.yaml
	@echo "✓ Permissions fixed"

# 4. Install Helm
install-helm:
	@echo "Installing Helm..."
	@if command -v helm >/dev/null 2>&1; then \
		echo "Helm is already installed"; \
		helm version; \
	else \
		curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-4; \
		chmod 700 get_helm.sh; \
		./get_helm.sh; \
		rm -f get_helm.sh; \
		echo "✓ Helm installed"; \
	fi

# 5. Remove Traefik gateway
remove-traefik:
	@echo "Removing Traefik gateway..."
	@if [ -f /var/lib/rancher/k3s/server/manifests/traefik.yaml ]; then \
		sudo rm -rf /var/lib/rancher/k3s/server/manifests/traefik.yaml; \
		helm uninstall traefik traefik-crd -n kube-system 2>/dev/null || true; \
		sudo systemctl restart k3s; \
		echo "✓ Traefik removed and k3s restarted"; \
	else \
		echo "Traefik manifest not found, skipping..."; \
	fi

# 6. Install k9s
install-k9s:
	@echo "Installing k9s..."
	@if command -v k9s >/dev/null 2>&1; then \
		echo "k9s is already installed"; \
		k9s version; \
	else \
		curl -sS https://webi.sh/k9s | sh; \
		. ~/.config/envman/PATH.env; \
		echo "✓ k9s installed"; \
	fi

# 7. Install Skaffold
install-skaffold:
	@echo "Installing Skaffold..."
	@if command -v skaffold >/dev/null 2>&1; then \
		echo "Skaffold is already installed"; \
		skaffold version; \
	else \
		curl -Lo skaffold https://storage.googleapis.com/skaffold/releases/latest/skaffold-linux-amd64; \
		sudo install skaffold /usr/local/bin/; \
		rm -f skaffold; \
		echo "✓ Skaffold installed"; \
	fi
