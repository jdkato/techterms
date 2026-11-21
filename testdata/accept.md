# Deploying the storage layer

Bootstrap the cluster with kubeadm, and let the apiserver admit the
subresources. Build the images with Buildx, and run them with runc behind
dockerd. Tune each node with sysctl, trace requests with Zipkin, and collect
metrics with Telegraf. The integration tests run on Testcontainers, the
nodes sit on vSphere, and Ceph holds the volumes.

Ceph's monitors and both Cephs stay in sync.
